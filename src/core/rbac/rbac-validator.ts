import jwt from "jsonwebtoken";
import { readFileSync } from "fs";
import { resolve } from "path";
import { SchemaLoader } from "../schema/loader";
import e from "express";

interface RBACRule {
    user_role: string;
    attributes: string[];
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

const configPath = resolve(__dirname, "../../schemas/rbac/mongorestrbacjson.json");

console.log('RBAC config path:', configPath);

// Cache for RBAC configuration
let rbacConfigCache: any = [];

rbacConfigCache = SchemaLoader.getCachedSchema(configPath);

function loadRBACConfig(): CollectionRBAC[] {
    if (!rbacConfigCache || rbacConfigCache.length === 0) {
        console.log('Loading RBAC config from file:', configPath);
        try {
            const configContent = readFileSync(configPath, 'utf-8');
            const parsedConfig = JSON.parse(configContent);
            
            // Handle both old array format and new object format
            if (Array.isArray(parsedConfig)) {
                rbacConfigCache = parsedConfig; // Old format
            } else if (parsedConfig.collections) {
                rbacConfigCache = parsedConfig.collections; // New format
            } else {
                rbacConfigCache = []; // Fallback
            }
        } catch (error) {
            console.error('Error loading RBAC config:', error);
            rbacConfigCache = [];
        }
    }
    return rbacConfigCache;
}

loadRBACConfig();

/**
 * Get allowed attributes for a specific collection, operation and user roles
 */
export function getAllowedAttributes(
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
    const allowedAttributes = new Set<string>();
    
    // If no user roles provided, default to 'default' role
    if(userRoles.length === 0) {
        console.warn(`No roles found for user, defaulting to 'default' role`);
        userRoles = ['default'];
    }

    // Always add default role attributes first if exists
    const defaultRule = operationRules.find(rule => rule.user_role === "default");
    if(!defaultRule?.attributes.includes("none")) {
        defaultRule?.attributes.forEach(attr => allowedAttributes.add(attr));
    }

    // Add attributes for each user role (excluding default since we already added it)
    userRoles.forEach(role => {
        if (role !== 'default') {
            const rule = operationRules.find(r => r.user_role === role);
            if (rule && !rule.attributes.includes("none")) {
                rule.attributes.forEach(attr => allowedAttributes.add(attr));
            }
        }
    });
    
    return Array.from(allowedAttributes);
}

/**
 * Main RBAC Validator function
 */
export function RBACValidator(
    collectionName: string, 
    operation: 'read' | 'write' | 'delete',
    user_jwt: string
): string[] {
    if (!collectionName || !operation || !user_jwt) {
        return [];
    }

    let user: any;
    try {
        user = jwt.decode(user_jwt);
    } catch (error) {
        console.error('Error decoding JWT:', error);
        return [];
    }

    if (!user || typeof user !== 'object') {
        return [];
    }

    // Extract user roles - handle different JWT structures
    let userRoles: string[] = [];
    
    if (user.roles) {
        userRoles = Array.isArray(user.roles) ? user.roles : [user.roles];
    } else if (user.role) {
        userRoles = Array.isArray(user.role) ? user.role : [user.role];
    } else {
        // Default role if no roles found
        userRoles = ['default'];
    }

    return getAllowedAttributes(collectionName, operation, userRoles);
}

/**
 * Check if user can access specific attributes
 */
export function canAccessAttributes(
    collectionName: string,
    operation: 'read' | 'write' | 'delete',
    user_jwt: string,
    requestedAttributes: string[]
): { allowed: string[], denied: string[] } {
    const allowedAttributes = RBACValidator(collectionName, operation, user_jwt);
    
    const allowed: string[] = [];
    const denied: string[] = [];
    
    for (const attr of requestedAttributes) {
        if (allowedAttributes.includes(attr)) {
            allowed.push(attr);
        } else {
            denied.push(attr);
        }
    }
    
    return { allowed, denied };
}

/**
 * Filter object properties based on RBAC permissions
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
    
    const allowedAttributes = RBACValidator(collectionName, operation, user_jwt);
    
    if (allowedAttributes.length === 0) {
        return {};
    }
    
    const filteredData: any = {};
    
    for (const attr of allowedAttributes) {
        if (data.hasOwnProperty(attr)) {
            filteredData[attr] = data[attr];
        }
    }
    
    return filteredData;
}

/**
 * Get all collections and their permissions for a user
 */
export function getUserPermissions(user_jwt: string): Record<string, Record<string, string[]>> {
    const rbacConfig = loadRBACConfig();
    const permissions: Record<string, Record<string, string[]>> = {};
    
    for (const collectionConfig of rbacConfig) {
        const collectionName = collectionConfig.collection_name;
        permissions[collectionName] = {
            read: RBACValidator(collectionName, 'read', user_jwt),
            write: RBACValidator(collectionName, 'write', user_jwt),
            delete: RBACValidator(collectionName, 'delete', user_jwt)
        };
    }
    
    return permissions;
}