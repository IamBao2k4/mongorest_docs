import jwt from "jsonwebtoken";
import { readFileSync } from "fs";
import { resolve } from "path";
import { SchemaLoader } from "../schema/loader";
import { RBACPatternHandler, createRBACHandler, processDataWithRBAC } from "./rbac-syntax-handler";
import { UserContext, ProcessingResult } from "./rbac-syntax";

// ================================
// INTERFACES
// ================================

interface RBACRule {
    user_role: string;
    patterns: string[];
}

interface RBACConfig {
    read: RBACRule[];
    write: RBACRule[];
    delete: RBACRule[];
}

interface CollectionRBAC {
    collection_name: string;
    rbac_config: RBACConfig;
}

interface ExtendedJWTPayload {
    sub?: string;
    userId?: string;
    teamId?: string;
    roles?: string[] | string;
    role?: string[] | string;
    isAdmin?: boolean;
    permissions?: string[];
    exp?: number;
    iat?: number;
}

interface RBACValidationResult {
    isValid: boolean;
    allowedFields: string[];
    deniedFields: string[];
    patterns: string[];
    filteredData?: any;
    errors?: string[];
}

// ================================
// CONSTANTS AND CACHE
// ================================

const configPath = resolve(__dirname, "../../schemas/rbac/mongorestrbacjson.json");

// Cache for RBAC configuration and pattern handler
let rbacConfigCache: any = [];
let patternHandler: RBACPatternHandler;

// ================================
// INITIALIZATION FUNCTIONS
// ================================

/**
 * Initialize and return pattern handler singleton
 */
function initializePatternHandler(): RBACPatternHandler {
    if (!patternHandler) {
        patternHandler = createRBACHandler(process.env.NODE_ENV === 'development');
    }
    return patternHandler;
}

/**
 * Load RBAC configuration from cache or file
 */
function loadRBACConfig(): CollectionRBAC[] {
    if (!rbacConfigCache || rbacConfigCache.length === 0) {
        console.log('Loading RBAC config from file:', configPath);
        try {
            // Try to get from schema loader cache first
            const cachedConfig = SchemaLoader.getCachedSchema(configPath);
            if (cachedConfig && cachedConfig.collection) {
                rbacConfigCache = cachedConfig.collection;
                return rbacConfigCache;
            }

            // Fall back to file read
            const configContent = readFileSync(configPath, 'utf-8');
            const parsedConfig = JSON.parse(configContent);
            
            // Handle both old array format and new object format
            if (Array.isArray(parsedConfig)) {
                rbacConfigCache = parsedConfig;
            } else if (parsedConfig.collections) {
                rbacConfigCache = parsedConfig.collections;
            } else {
                console.warn('Invalid RBAC config format, using empty array');
                rbacConfigCache = [];
            }
        } catch (error) {
            console.error('Error loading RBAC config:', error);
            rbacConfigCache = [];
        }
    }
    return rbacConfigCache;
}

/**
 * Extract comprehensive user context from JWT payload
 */
function extractUserContext(jwtPayload: ExtendedJWTPayload): UserContext {
    const userId = jwtPayload.sub || jwtPayload.userId || 'anonymous';
    
    // Extract roles from various possible fields
    let roles: string[] = [];
    if (jwtPayload.roles) {
        roles = Array.isArray(jwtPayload.roles) ? jwtPayload.roles : [jwtPayload.roles];
    } else if (jwtPayload.role) {
        roles = Array.isArray(jwtPayload.role) ? jwtPayload.role : [jwtPayload.role];
    } else {
        roles = ['default'];
    }

    return {
        userId,
        teamId: jwtPayload.teamId,
        roles,
        isAdmin: jwtPayload.isAdmin || roles.includes('admin'),
        permissions: jwtPayload.permissions || []
    };
}

/**
 * Parse JWT token safely
 */
function parseJWTToken(token: string): ExtendedJWTPayload | null {
    try {
        const decoded = jwt.decode(token);
        if (!decoded || typeof decoded !== 'object') {
            return null;
        }
        return decoded as ExtendedJWTPayload;
    } catch (error) {
        console.error('Error decoding JWT:', error);
        return null;
    }
}

// ================================
// CORE RBAC FUNCTIONS
// ================================

/**
 * Get allowed patterns for a specific collection, operation and user roles
 * This is the core function that retrieves patterns based on user roles
 */
export function getAllowedPatterns(
    collectionName: string,
    operation: 'read' | 'write' | 'delete',
    userRoles: string[]
): string[] {
    const rbacConfig = loadRBACConfig();
    
    const collectionConfig = rbacConfig.find(
        config => config.collection_name === collectionName
    );
    
    if (!collectionConfig) {
        console.warn(`No RBAC configuration found for collection: ${collectionName}`);
        return [];
    }
    
    const operationRules = collectionConfig.rbac_config[operation];
    if (!operationRules) {
        console.warn(`No ${operation} rules found for collection: ${collectionName}`);
        return [];
    }
    
    const allowedPatterns = new Set<string>();
    
    // If no user roles provided, default to 'default' role
    if (userRoles.length === 0) {
        console.warn(`No roles found for user, defaulting to 'default' role`);
        userRoles = ['default'];
    }

    // Always add default role patterns first if exists
    const defaultRule = operationRules.find(rule => rule.user_role === "default");
    if (defaultRule?.patterns) {
        defaultRule.patterns.forEach(pattern => allowedPatterns.add(pattern));
    }

    // Add patterns for each user role (excluding default since we already added it)
    userRoles.forEach(role => {
        if (role !== 'default') {
            const rule = operationRules.find(r => r.user_role === role);
            if (rule?.patterns) {
                rule.patterns.forEach(pattern => allowedPatterns.add(pattern));
            }
        }
    });
    
    return Array.from(allowedPatterns);
}

/**
 * Get simple field patterns only (backward compatibility)
 * @deprecated Use getAllowedPatterns with pattern handler instead
 */
export function getAllowedAttributes(
    collectionName: string, 
    operation: 'read' | 'write' | 'delete', 
    userRoles: string[]
): string[] {
    const patterns = getAllowedPatterns(collectionName, operation, userRoles);
    
    // Filter out complex patterns, return only simple field names
    return patterns.filter(pattern => 
        // Simple field names without dots, wildcards, or special characters
        /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(pattern)
    );
}

/**
 * Main RBAC validation function with comprehensive pattern processing
 */
export function validateRBACAccess(
    collectionName: string,
    operation: 'read' | 'write' | 'delete',
    user_jwt: string,
    data?: any,
    requestedFields?: string[]
): RBACValidationResult {
    // Parse JWT token
    const user = parseJWTToken(user_jwt);
    if (!user) {
        return {
            isValid: false,
            allowedFields: [],
            deniedFields: requestedFields || [],
            patterns: [],
            errors: ['Invalid JWT token']
        };
    }

    // Extract user context and roles
    const userContext = extractUserContext(user);
    const userRoles = userContext.roles;

    // Get allowed patterns for the user
    const allowedPatterns = getAllowedPatterns(collectionName, operation, userRoles);
    
    if (allowedPatterns.length === 0) {
        return {
            isValid: false,
            allowedFields: [],
            deniedFields: requestedFields || [],
            patterns: [],
            errors: [`No permissions found for collection: ${collectionName}, operation: ${operation}, roles: ${userRoles.join(', ')}`]
        };
    }

    const handler = initializePatternHandler();
    
    // If specific fields are requested, validate each one
    if (requestedFields && requestedFields.length > 0) {
        const allowedFields: string[] = [];
        const deniedFields: string[] = [];
        
        for (const field of requestedFields) {
            const isAllowed = allowedPatterns.some(pattern => 
                handler.matchesPath(pattern, field, userContext)
            );
            
            if (isAllowed) {
                allowedFields.push(field);
            } else {
                deniedFields.push(field);
            }
        }
        
        return {
            isValid: allowedFields.length > 0,
            allowedFields,
            deniedFields,
            patterns: allowedPatterns,
            filteredData: data ? processDataWithPatterns(data, allowedPatterns, userContext) : undefined
        };
    }

    // If data is provided, filter it according to patterns
    if (data) {
        const result = handler.process(data, allowedPatterns, userContext);
        
        return {
            isValid: result.matched,
            allowedFields: [],
            deniedFields: [],
            patterns: allowedPatterns,
            filteredData: result.data,
            errors: result.errors
        };
    }

    // Default case - just return patterns
    return {
        isValid: true,
        allowedFields: [],
        deniedFields: [],
        patterns: allowedPatterns
    };
}

/**
 * Process data with patterns using the pattern handler
 */
function processDataWithPatterns(
    data: any,
    patterns: string[],
    userContext: UserContext
): any {
    const handler = initializePatternHandler();
    const result = handler.process(data, patterns, userContext);
    return result.matched ? result.data : {};
}

/**
 * Legacy RBAC Validator function - maintained for backward compatibility
 * @deprecated Use validateRBACAccess instead
 */
export function RBACValidator(
    collectionName: string, 
    operation: 'read' | 'write' | 'delete',
    user_jwt: string
): string[] {
    const result = validateRBACAccess(collectionName, operation, user_jwt);
    if (result.allowedFields.length > 0) {
        return result.allowedFields;
    }
    
    // Instead of using deprecated getAllowedAttributes, use getAllowedPatterns
    const user = parseJWTToken(user_jwt);
    if (!user) {
        return [];
    }
    
    const userContext = extractUserContext(user);
    const patterns = getAllowedPatterns(collectionName, operation, userContext.roles);
    
    // Filter out complex patterns, return only simple field names
    return patterns.filter(pattern => 
        // Simple field names without dots, wildcards, or special characters
        /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(pattern)
    );
}

/**
 * Process data with RBAC patterns - enhanced version
 */
export function processDataWithRBACPatterns(
    collectionName: string,
    operation: 'read' | 'write' | 'delete',
    user_jwt: string,
    data: any
): ProcessingResult {
    if (!data) {
        return {
            data: null,
            matched: false,
            errors: ['No data provided']
        };
    }

    const user = parseJWTToken(user_jwt);
    if (!user) {
        return {
            data: null,
            matched: false,
            errors: ['Invalid JWT token']
        };
    }

    const userContext = extractUserContext(user);
    const allowedPatterns = getAllowedPatterns(collectionName, operation, userContext.roles);
    
    if (allowedPatterns.length === 0) {
        return {
            data: {},
            matched: true,
            errors: [`No patterns found for collection: ${collectionName}, operation: ${operation}`]
        };
    }

    // Use pattern handler for processing
    const handler = initializePatternHandler();
    return handler.process(data, allowedPatterns, userContext);
}

/**
 * Enhanced filter function with better error handling and performance
 */
export function filterByRBAC(
    collectionName: string,
    operation: 'read' | 'write' | 'delete',
    user_jwt: string,
    data: any
): any {
    if (!data || typeof data !== 'object') {
        return data;
    }
    
    const result = processDataWithRBACPatterns(collectionName, operation, user_jwt, data);
    
    if (!result.matched) {
        console.warn('RBAC filtering failed:', result.errors);
        return {};
    }
    
    return result.data || {};
}

/**
 * Enhanced array filtering with batch processing
 */
export function filterArrayByRBAC(
    collectionName: string,
    operation: 'read' | 'write' | 'delete',
    user_jwt: string,
    dataArray: any[]
): any[] {
    if (!Array.isArray(dataArray)) {
        return [];
    }
    
    // Get user context and patterns once for efficiency
    const user = parseJWTToken(user_jwt);
    if (!user) {
        console.warn('Invalid JWT token in array filtering');
        return [];
    }

    const userContext = extractUserContext(user);
    const allowedPatterns = getAllowedPatterns(collectionName, operation, userContext.roles);
    
    if (allowedPatterns.length === 0) {
        return [];
    }

    const handler = initializePatternHandler();
    
    return dataArray
        .map(item => {
            if (!item || typeof item !== 'object') {
                return item;
            }
            
            const result = handler.process(item, allowedPatterns, userContext);
            return result.matched ? result.data : null;
        })
        .filter(item => item && Object.keys(item).length > 0);
}

/**
 * Check if user can access specific attributes with enhanced pattern support
 */
export function canAccessAttributes(
    collectionName: string,
    operation: 'read' | 'write' | 'delete',
    user_jwt: string,
    requestedAttributes: string[]
): { allowed: string[], denied: string[], patterns: string[], details: Record<string, boolean> } {
    const user = parseJWTToken(user_jwt);
    if (!user) {
        return { 
            allowed: [], 
            denied: requestedAttributes, 
            patterns: [],
            details: requestedAttributes.reduce((acc, attr) => ({ ...acc, [attr]: false }), {})
        };
    }

    const userContext = extractUserContext(user);
    const allowedPatterns = getAllowedPatterns(collectionName, operation, userContext.roles);
    
    const allowed: string[] = [];
    const denied: string[] = [];
    const details: Record<string, boolean> = {};
    
    const handler = initializePatternHandler();
    
    // Check each requested attribute against patterns
    for (const attr of requestedAttributes) {
        const isPatternMatch = allowedPatterns.some(pattern => 
            handler.matchesPath(pattern, attr, userContext)
        );
        
        details[attr] = isPatternMatch;
        
        if (isPatternMatch) {
            allowed.push(attr);
        } else {
            denied.push(attr);
        }
    }
    
    return { allowed, denied, patterns: allowedPatterns, details };
}

/**
 * Get comprehensive user permissions for all collections
 */
export function getUserPermissions(user_jwt: string): Record<string, Record<string, { attributes: string[], patterns: string[] }>> {
    const rbacConfig = loadRBACConfig();
    const permissions: Record<string, Record<string, { attributes: string[], patterns: string[] }>> = {};
    
    const user = parseJWTToken(user_jwt);
    if (!user) {
        return {};
    }

    const userContext = extractUserContext(user);
    const userRoles = userContext.roles;
    
    for (const collectionConfig of rbacConfig) {
        const collectionName = collectionConfig.collection_name;
        permissions[collectionName] = {
            read: {
                attributes: getAllowedAttributes(collectionName, 'read', userRoles),
                patterns: getAllowedPatterns(collectionName, 'read', userRoles)
            },
            write: {
                attributes: getAllowedAttributes(collectionName, 'write', userRoles),
                patterns: getAllowedPatterns(collectionName, 'write', userRoles)
            },
            delete: {
                attributes: getAllowedAttributes(collectionName, 'delete', userRoles),
                patterns: getAllowedPatterns(collectionName, 'delete', userRoles)
            }
        };
    }
    
    return permissions;
}

/**
 * Enhanced permission checking with context resolution
 */
export function hasPermission(
    collectionName: string,
    operation: 'read' | 'write' | 'delete',
    user_jwt: string,
    requestedPath?: string
): boolean {
    const user = parseJWTToken(user_jwt);
    if (!user) {
        return false;
    }

    const userContext = extractUserContext(user);
    const allowedPatterns = getAllowedPatterns(collectionName, operation, userContext.roles);

    if (allowedPatterns.length === 0) {
        return false;
    }
    
    if (requestedPath) {
        // Check specific path against patterns
        const handler = initializePatternHandler();
        return allowedPatterns.some(pattern => 
            handler.matchesPath(pattern, requestedPath, userContext)
        );
    }
    
    // If no specific path requested, check if user has any permissions
    return true;
}

/**
 * Process nested object with dynamic context resolution
 */
export function processNestedObjectRBAC(
    collectionName: string,
    operation: 'read' | 'write' | 'delete',
    user_jwt: string,
    data: any,
    contextOverrides?: Partial<UserContext>
): any {
    const user = parseJWTToken(user_jwt);
    if (!user) {
        return {};
    }

    const userContext = { ...extractUserContext(user), ...contextOverrides };
    const allowedPatterns = getAllowedPatterns(collectionName, operation, userContext.roles);
    
    if (allowedPatterns.length === 0) {
        return {};
    }
    
    return processDataWithRBAC(data, allowedPatterns, userContext);
}

/**
 * Batch process multiple collections data
 */
export function batchFilterByRBAC(
    user_jwt: string,
    dataByCollection: Record<string, any[]>,
    operation: 'read' | 'write' | 'delete' = 'read'
): Record<string, any[]> {
    const result: Record<string, any[]> = {};
    
    for (const [collectionName, data] of Object.entries(dataByCollection)) {
        result[collectionName] = filterArrayByRBAC(collectionName, operation, user_jwt, data);
    }
    
    return result;
}

// ================================
// VALIDATION AND UTILITY FUNCTIONS
// ================================

/**
 * Validate RBAC patterns in configuration
 */
export function validateRBACConfiguration(): { isValid: boolean, errors: string[] } {
    const rbacConfig = loadRBACConfig();
    const handler = initializePatternHandler();
    const errors: string[] = [];
    
    for (const collectionConfig of rbacConfig) {
        const collectionName = collectionConfig.collection_name;
        
        for (const operation of ['read', 'write', 'delete'] as const) {
            const rules = collectionConfig.rbac_config[operation];
            
            if (!rules) {
                errors.push(`Missing ${operation} rules for collection ${collectionName}`);
                continue;
            }
            
            for (const rule of rules) {
                if (!rule.patterns || !Array.isArray(rule.patterns)) {
                    errors.push(`Invalid patterns for collection ${collectionName}, operation ${operation}, role ${rule.user_role}`);
                    continue;
                }
                
                for (const pattern of rule.patterns) {
                    const patternErrors = handler.validatePattern(pattern);
                    if (patternErrors.length > 0) {
                        errors.push(
                            `Collection ${collectionName}, operation ${operation}, role ${rule.user_role}: ${patternErrors.join(', ')}`
                        );
                    }
                }
            }
        }
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * Get pattern handler instance for external use
 */
export function getPatternHandler(): RBACPatternHandler {
    return initializePatternHandler();
}

/**
 * Get detailed RBAC configuration for debugging
 */
export function getRBACConfigurationDetails(): {
    collections: string[],
    totalRules: number,
    patternsByCollection: Record<string, Record<string, number>>,
    cacheStats: { size: number, patterns: string[] }
} {
    const rbacConfig = loadRBACConfig();
    const handler = initializePatternHandler();
    
    const collections = rbacConfig.map(c => c.collection_name);
    let totalRules = 0;
    const patternsByCollection: Record<string, Record<string, number>> = {};
    
    for (const collectionConfig of rbacConfig) {
        const collectionName = collectionConfig.collection_name;
        patternsByCollection[collectionName] = {};
        
        for (const operation of ['read', 'write', 'delete'] as const) {
            const rules = collectionConfig.rbac_config[operation] || [];
            totalRules += rules.length;
            
            const totalPatterns = rules.reduce((sum, rule) => sum + (rule.patterns?.length || 0), 0);
            patternsByCollection[collectionName][operation] = totalPatterns;
        }
    }
    
    return {
        collections,
        totalRules,
        patternsByCollection,
        cacheStats: handler.getCacheStats()
    };
}

// Initialize the configuration on module load
loadRBACConfig();

// ================================
// EXPORTS
// ================================

export {
    // Types
    type RBACValidationResult,
    type CollectionRBAC,
    type RBACConfig,
    type RBACRule,
    type ExtendedJWTPayload,
    
    processDataWithPatterns,
    
    // Configuration and utilities
    loadRBACConfig,
    extractUserContext,
    parseJWTToken,
};