import {
    CompiledPattern,
    ProcessingResult,
    UserContext,
    Token,
    TokenType,
    SegmentType,
    PatternSegment
} from './rbac-syntax'

// ================================
// CONSTANTS
// ================================

const VALID_CONTEXTS = ['@self', '@owner', '@team', '@public', '@admin'];
const VALID_TYPES = ['str', 'num', 'bool', 'arr', 'obj'];
const MAX_NESTING_DEPTH = 10;
const MAX_ARRAY_SIZE = 1000;

// ================================
// RBAC SYNTAX HANDLER CLASS
// ================================

export class RBACPatternHandler {
    private compiledPatternCache = new Map<string, CompiledPattern>();
    private debugMode: boolean = false;

    constructor(debugMode: boolean = false) {
        this.debugMode = debugMode;
    }

    // ================================
    // PUBLIC API METHODS
    // ================================

    /**
     * Process data with RBAC patterns
     */
    public process(
        data: any,
        patterns: string[],
        context: UserContext
    ): ProcessingResult {
        try {
            const compiledPatterns = this.compilePatterns(patterns);
            const { includes, excludes } = this.separatePatterns(compiledPatterns);

            let result = this.applyIncludes(data, includes, context);
            result = this.applyExcludes(result, excludes, context);
            
            return {
                data: this.cleanup(result),
                matched: true,
                errors: []
            };
        } catch (error) {
            return {
                data: null,
                matched: false,
                errors: [error instanceof Error ? error.message : String(error)]
            };
        }
    }

    /**
     * Validate pattern syntax
     */
    public validatePattern(pattern: string): string[] {
        const errors: string[] = [];

        // Basic syntax validation
        if (pattern.startsWith('.') || pattern.endsWith('.')) {
            errors.push('Pattern cannot start or end with dot');
        }

        if (pattern.includes('..')) {
            errors.push('Pattern cannot contain consecutive dots');
        }

        if (pattern.includes('[]')) {
            errors.push('Empty array brackets not allowed');
        }

        // Context validation
        const contextMatches = pattern.match(/@\w+/g);
        if (contextMatches) {
            for (const context of contextMatches) {
                if (!VALID_CONTEXTS.includes(context)) {
                    errors.push(`Invalid context: ${context}`);
                }
            }
        }

        // Type validation
        const typeMatches = pattern.match(/:\w+/g);
        if (typeMatches) {
            for (const typeMatch of typeMatches) {
                const type = typeMatch.substring(1);
                if (!VALID_TYPES.includes(type)) {
                    errors.push(`Invalid type: ${type}`);
                }
            }
        }

        // Try tokenizing to catch syntax errors
        try {
            this.tokenize(pattern);
        } catch (error) {
            errors.push(`Tokenization error: ${error instanceof Error ? error.message : String(error)}`);
        }

        return errors;
    }

    /**
     * Check if pattern matches a specific field path
     */
    public matchesPath(pattern: string, fieldPath: string, context?: UserContext): boolean {
        try {
            const compiledPattern = this.compilePattern(pattern);
            const resolvedPattern = context ? this.resolveContext(compiledPattern, context) : compiledPattern;
            return this.pathMatches(fieldPath.split('.'), resolvedPattern.segments);
        } catch {
            return false;
        }
    }

    // ================================
    // TOKENIZATION
    // ================================

    private tokenize(pattern: string): Token[] {
        const tokens: Token[] = [];
        let position = 0;

        while (position < pattern.length) {
            const char = pattern[position];

            if (char === ' ') {
                position++;
                continue;
            }

            // Dot notation
            if (char === '.') {
                if (pattern[position + 1] === '*' && pattern[position + 2] === '*') {
                    tokens.push({ type: TokenType.DEEP_WILDCARD, value: '.**', position });
                    position += 3;
                } else if (pattern[position + 1] === '*') {
                    tokens.push({ type: TokenType.WILDCARD, value: '.*', position });
                    position += 2;
                } else {
                    tokens.push({ type: TokenType.DOT, value: '.', position });
                    position++;
                }
                continue;
            }

            // Standalone wildcard
            if (char === '*') {
                if (pattern[position + 1] === '*') {
                    tokens.push({ type: TokenType.DEEP_WILDCARD, value: '**', position });
                    position += 2;
                } else {
                    tokens.push({ type: TokenType.WILDCARD, value: '*', position });
                    position++;
                }
                continue;
            }

            // Negation
            if (char === '!') {
                tokens.push({ type: TokenType.NEGATION, value: '!', position });
                position++;
                continue;
            }

            // Array access
            if (char === '[') {
                const arrayPattern = this.extractArrayPattern(pattern, position);
                if (arrayPattern.includes(':')) {
                    tokens.push({ type: TokenType.ARRAY_RANGE, value: arrayPattern, position });
                } else {
                    tokens.push({ type: TokenType.ARRAY_INDEX, value: arrayPattern, position });
                }


                position += arrayPattern.length + 2; // +2 for brackets
                continue;
            }

            // Context
            if (char === '@') {
                const contextMatch = pattern.substring(position).match(/^@\w+/);
                if (contextMatch) {
                    tokens.push({ type: TokenType.CONTEXT, value: contextMatch[0], position });
                    position += contextMatch[0].length;
                    continue;
                }
            }

            // Operators
            if (char === '&') {
                tokens.push({ type: TokenType.AND, value: '&', position });
                position++;
                continue;
            }

            if (char === '|') {
                tokens.push({ type: TokenType.OR, value: '|', position });
                position++;
                continue;
            }

            // Parentheses
            if (char === '(') {
                tokens.push({ type: TokenType.LPAREN, value: '(', position });
                position++;
                continue;
            }

            if (char === ')') {
                tokens.push({ type: TokenType.RPAREN, value: ')', position });
                position++;
                continue;
            }

            // Braces
            if (char === '{') {
                tokens.push({ type: TokenType.LBRACE, value: '{', position });
                position++;
                continue;
            }

            if (char === '}') {
                tokens.push({ type: TokenType.RBRACE, value: '}', position });
                position++;
                continue;
            }

            // Field name (with optional type check)
            const fieldMatch = pattern.substring(position).match(/^[a-zA-Z_][a-zA-Z0-9_]*(?::\w+)?/);
            if (fieldMatch) {
                const fieldValue = fieldMatch[0];
                if (fieldValue.includes(':')) {
                    tokens.push({ type: TokenType.TYPE_CHECK, value: fieldValue, position });
                } else {
                    tokens.push({ type: TokenType.FIELD, value: fieldValue, position });
                }
                position += fieldValue.length;
                continue;
            }

            // Optional modifier
            if (char === '?') {
                tokens.push({ type: TokenType.OPTIONAL, value: '?', position });
                position++;
                continue;
            }

            throw new Error(`Unexpected character '${char}' at position ${position}`);
        }

        return tokens;
    }

    private extractArrayPattern(pattern: string, startPos: number): string {
        const endPos = pattern.indexOf(']', startPos);
        if (endPos === -1) {
            throw new Error('Unclosed array bracket');
        }

        return pattern.substring(startPos + 1, endPos);
    }

    // ================================
    // PATTERN COMPILATION
    // ================================

    private compilePattern(pattern: string): CompiledPattern {
        if (this.compiledPatternCache.has(pattern)) {
            return this.compiledPatternCache.get(pattern)!;
        }

        const tokens = this.tokenize(pattern);
        const segments = this.parseTokens(tokens);
        
        const compiled: CompiledPattern = {
            segments,
            isNegation: tokens.some(t => t.type === TokenType.NEGATION),
            hasContext: tokens.some(t => t.type === TokenType.CONTEXT),
            complexity: this.calculateComplexity(segments)
        };

        this.compiledPatternCache.set(pattern, compiled);
        return compiled;
    }

    private compilePatterns(patterns: string[]): CompiledPattern[] {
        return patterns.map(pattern => this.compilePattern(pattern));
    }

    private parseTokens(tokens: Token[]): PatternSegment[] {
        const segments: PatternSegment[] = [];
        let i = 0;

        while (i < tokens.length) {
            const token = tokens[i];

            switch (token.type) {
                case TokenType.FIELD:
                    segments.push({
                        type: SegmentType.FIELD,
                        name: token.value
                    });
                    break;

                case TokenType.WILDCARD:
                    segments.push({
                        type: SegmentType.WILDCARD
                    });
                    break;

                case TokenType.DEEP_WILDCARD:
                    segments.push({
                        type: SegmentType.DEEP_WILDCARD
                    });
                    break;

                case TokenType.ARRAY_INDEX:
                    const index = parseInt(token.value);
                    segments.push({
                        type: SegmentType.ARRAY_INDEX,
                        index: isNaN(index) ? undefined : index
                    });
                    break;

                case TokenType.ARRAY_RANGE:
                    const [start, end] = token.value.split(':').map(s => s ? parseInt(s) : undefined);
                    segments.push({
                        type: SegmentType.ARRAY_RANGE,
                        start,
                        end
                    });
                    break;

                case TokenType.CONTEXT:
                    segments.push({
                        type: SegmentType.CONTEXT,
                        context: token.value
                    });
                    break;

                case TokenType.TYPE_CHECK:
                    const [field, dataType] = token.value.split(':');
                    segments.push({
                        type: SegmentType.TYPE_CHECK,
                        name: field,
                        dataType
                    });
                    break;

                case TokenType.NEGATION:
                    // Handle negation by marking the next segment
                    if (i + 1 < tokens.length) {
                        i++;
                        const nextSegment = this.parseTokens([tokens[i]])[0];
                        if (nextSegment) {
                            nextSegment.isNegation = true;
                            segments.push(nextSegment);
                        }
                    }
                    break;

                case TokenType.DOT:
                    // Skip dots, they're separators
                    break;
            }

            i++;
        }

        return segments;
    }

    private calculateComplexity(segments: PatternSegment[]): number {
        let complexity = 0;
        for (const segment of segments) {
            switch (segment.type) {
                case SegmentType.FIELD:
                    complexity += 1;
                    break;
                case SegmentType.WILDCARD:
                    complexity += 3;
                    break;
                case SegmentType.DEEP_WILDCARD:
                    complexity += 5;
                    break;
                case SegmentType.ARRAY_WILDCARD:
                case SegmentType.ARRAY_INDEX:
                case SegmentType.ARRAY_RANGE:
                    complexity += 4;
                    break;
                case SegmentType.CONTEXT:
                    complexity += 2;
                    break;
                case SegmentType.TYPE_CHECK:
                    complexity += 2;
                    break;
            }
        }
        return complexity;
    }

    // ================================
    // CONTEXT RESOLUTION
    // ================================

    private resolveContext(pattern: CompiledPattern, context: UserContext): CompiledPattern {
        if (!pattern.hasContext) {
            return pattern;
        }

        const resolvedSegments = pattern.segments.map(segment => {
            if (segment.type === SegmentType.CONTEXT) {
                return this.resolveContextSegment(segment, context);
            }
            return segment;
        });

        return {
            ...pattern,
            segments: resolvedSegments
        };
    }

    private resolveContextSegment(segment: PatternSegment, context: UserContext): PatternSegment {
        switch (segment.context) {
            case '@self':
                return {
                    type: SegmentType.FIELD,
                    name: context.userId
                };

            case '@team':
                if (context.teamId) {
                    return {
                        type: SegmentType.FIELD,
                        name: context.teamId
                    };
                }
                break;

            case '@admin':
                if (context.isAdmin) {
                    return {
                        type: SegmentType.WILDCARD
                    };
                }
                break;

            case '@public':
                return {
                    type: SegmentType.FIELD,
                    name: 'public'
                };
        }

        // Return original segment if context cannot be resolved
        return segment;
    }

    // ================================
    // PATTERN SEPARATION
    // ================================

    private separatePatterns(patterns: CompiledPattern[]): { includes: CompiledPattern[], excludes: CompiledPattern[] } {
        const includes: CompiledPattern[] = [];
        const excludes: CompiledPattern[] = [];

        for (const pattern of patterns) {
            if (pattern.isNegation) {
                excludes.push(pattern);
            } else {
                includes.push(pattern);
            }
        }

        return { includes, excludes };
    }

    // ================================
    // DATA PROCESSING
    // ================================

    private applyIncludes(data: any, includes: CompiledPattern[], context: UserContext): any {
        if (includes.length === 0) {
            return {};
        }

        // Check for wildcard access
        const hasWildcard = includes.some(pattern => 
            pattern.segments.length === 1 && 
            pattern.segments[0].type === SegmentType.WILDCARD
        );

        if (hasWildcard) {
            return data;
        }

        const result = {};
        
        for (const pattern of includes) {
            const resolvedPattern = this.resolveContext(pattern, context);
            this.applyPatternToData(data, resolvedPattern.segments, result, []);
        }

        return result;
    }

    private applyExcludes(data: any, excludes: CompiledPattern[], context: UserContext): any {
        if (excludes.length === 0 || !data) {
            return data;
        }

        let result = this.deepClone(data);

        for (const pattern of excludes) {
            const resolvedPattern = this.resolveContext(pattern, context);
            result = this.removePatternFromData(result, resolvedPattern.segments, []);
        }

        return result;
    }

    private applyPatternToData(
        sourceData: any,
        segments: PatternSegment[],
        targetData: any,
        currentPath: string[]
    ): void {
        if (segments.length === 0 || sourceData === null || sourceData === undefined) {
            return;
        }

        const [currentSegment, ...remainingSegments] = segments;

        switch (currentSegment.type) {
            case SegmentType.FIELD:
                this.handleFieldSegment(sourceData, currentSegment, remainingSegments, targetData, currentPath);
                break;

            case SegmentType.WILDCARD:
                this.handleWildcardSegment(sourceData, remainingSegments, targetData, currentPath);
                break;

            case SegmentType.DEEP_WILDCARD:
                this.handleDeepWildcardSegment(sourceData, targetData, currentPath);
                break;

            case SegmentType.ARRAY_WILDCARD:
                this.handleArrayWildcardSegment(sourceData, remainingSegments, targetData, currentPath);
                break;

            case SegmentType.ARRAY_INDEX:
                this.handleArrayIndexSegment(sourceData, currentSegment, remainingSegments, targetData, currentPath);
                break;

            case SegmentType.ARRAY_RANGE:
                this.handleArrayRangeSegment(sourceData, currentSegment, remainingSegments, targetData, currentPath);
                break;

            case SegmentType.TYPE_CHECK:
                this.handleTypeCheckSegment(sourceData, currentSegment, remainingSegments, targetData, currentPath);
                break;
        }
    }

    private handleFieldSegment(
        sourceData: any,
        segment: PatternSegment,
        remainingSegments: PatternSegment[],
        targetData: any,
        currentPath: string[]
    ): void {
        if (!sourceData || typeof sourceData !== 'object' || !segment.name) {
            return;
        }

        const fieldValue = sourceData[segment.name];
        if (fieldValue === undefined) {
            return;
        }

        if (remainingSegments.length === 0) {
            targetData[segment.name] = fieldValue;
        } else {
            if (!targetData[segment.name]) {
                targetData[segment.name] = Array.isArray(fieldValue) ? [] : {};
            }
            this.applyPatternToData(
                fieldValue,
                remainingSegments,
                targetData[segment.name],
                [...currentPath, segment.name]
            );
        }
    }

    private handleWildcardSegment(
        sourceData: any,
        remainingSegments: PatternSegment[],
        targetData: any,
        currentPath: string[]
    ): void {
        if (!sourceData || typeof sourceData !== 'object') {
            return;
        }

        if (Array.isArray(sourceData)) {
            this.handleArrayWildcardSegment(sourceData, remainingSegments, targetData, currentPath);
            return;
        }

        for (const [key, value] of Object.entries(sourceData)) {
            if (remainingSegments.length === 0) {
                (targetData as any)[key] = value;
            } else {
                if (!(targetData as any)[key]) {
                    (targetData as any)[key] = Array.isArray(value) ? [] : {};
                }
                this.applyPatternToData(
                    value,
                    remainingSegments,
                    (targetData as any)[key],
                    [...currentPath, key]
                );
            }
        }
    }

    private handleDeepWildcardSegment(
        sourceData: any,
        targetData: any,
        currentPath: string[]
    ): void {
        if (currentPath.length > MAX_NESTING_DEPTH) {
            return;
        }

        if (Array.isArray(sourceData)) {
            for (let i = 0; i < Math.min(sourceData.length, MAX_ARRAY_SIZE); i++) {
                if (!targetData[i]) {
                    targetData[i] = Array.isArray(sourceData[i]) ? [] : {};
                }
                this.handleDeepWildcardSegment(sourceData[i], targetData[i], [...currentPath, i.toString()]);
            }
        } else if (sourceData && typeof sourceData === 'object') {
            for (const [key, value] of Object.entries(sourceData)) {
                (targetData as any)[key] = value;
                if (typeof value === 'object' && value !== null) {
                    if (!(targetData as any)[key]) {
                        (targetData as any)[key] = Array.isArray(value) ? [] : {};
                    }
                    this.handleDeepWildcardSegment(value, (targetData as any)[key], [...currentPath, key]);
                }
            }
        } else {
            // Primitive value, copy directly
            Object.assign(targetData, sourceData);
        }
    }

    private handleArrayWildcardSegment(
        sourceData: any,
        remainingSegments: PatternSegment[],
        targetData: any,
        currentPath: string[]
    ): void {
        if (!Array.isArray(sourceData)) {
            return;
        }

        for (let i = 0; i < Math.min(sourceData.length, MAX_ARRAY_SIZE); i++) {
            const item = sourceData[i];
            
            if (remainingSegments.length === 0) {
                (targetData as any)[i] = item;
            } else {
                if (!(targetData as any)[i]) {
                    (targetData as any)[i] = Array.isArray(item) ? [] : {};
                }
                this.applyPatternToData(
                    item,
                    remainingSegments,
                    (targetData as any)[i],
                    [...currentPath, i.toString()]
                );
            }
        }
    }

    private handleArrayIndexSegment(
        sourceData: any,
        segment: PatternSegment,
        remainingSegments: PatternSegment[],
        targetData: any,
        currentPath: string[]
    ): void {
        if (!Array.isArray(sourceData) || segment.index === undefined) {
            return;
        }

        const index = segment.index < 0 ? sourceData.length + segment.index : segment.index;
        if (index < 0 || index >= sourceData.length) {
            return;
        }

        const item = sourceData[index];

        if (remainingSegments.length === 0) {
            // For final values, create compact array by finding next available position
            if (!Array.isArray(targetData)) {
                // Convert to array if needed
                const keys = Object.keys(targetData);
                keys.forEach(key => delete targetData[key]);
                Object.setPrototypeOf(targetData, Array.prototype);
                targetData.length = 0;
            }
            
            // Add item to the end of array (compact, no empty slots)
            targetData.push(item);
        } else {
            // For intermediate processing, use the actual index but ensure it exists
            if (!Array.isArray(targetData)) {
                const keys = Object.keys(targetData);
                keys.forEach(key => delete targetData[key]);
                Object.setPrototypeOf(targetData, Array.prototype);
                targetData.length = 0;
            }

            // Ensure we have space for this index
            while (targetData.length <= index) {
                targetData.push(undefined);
            }

            if (!targetData[index]) {
                targetData[index] = Array.isArray(item) ? [] : {};
            }
            
            this.applyPatternToData(
                item,
                remainingSegments,
                targetData[index],
                [...currentPath, index.toString()]
            );

            // After processing, compact the array by removing undefined elements
            const compacted = targetData.filter((item: any) => item !== undefined);
            targetData.length = 0;
            targetData.push(...compacted);
        }
    }

    private handleArrayRangeSegment(
        sourceData: any,
        segment: PatternSegment,
        remainingSegments: PatternSegment[],
        targetData: any,
        currentPath: string[]
    ): void {
        if (!Array.isArray(sourceData)) {
            return;
        }

        const start = segment.start ?? 0;
        const end = segment.end ?? sourceData.length;
        const actualStart = start < 0 ? sourceData.length + start : start;
        const actualEnd = end < 0 ? sourceData.length + end : end;

        for (let i = actualStart; i < Math.min(actualEnd, sourceData.length, MAX_ARRAY_SIZE); i++) {
            const item = sourceData[i];

            if (remainingSegments.length === 0) {
                (targetData as any)[i] = item;
            } else {
                if (!(targetData as any)[i]) {
                    (targetData as any)[i] = Array.isArray(item) ? [] : {};
                }
                this.applyPatternToData(
                    item,
                    remainingSegments,
                    (targetData as any)[i],
                    [...currentPath, i.toString()]
                );
            }
        }
    }

    private handleTypeCheckSegment(
        sourceData: any,
        segment: PatternSegment,
        remainingSegments: PatternSegment[],
        targetData: any,
        currentPath: string[]
    ): void {
        if (!sourceData || typeof sourceData !== 'object' || !segment.name || !segment.dataType) {
            return;
        }

        const fieldValue = sourceData[segment.name];
        if (!this.checkType(fieldValue, segment.dataType)) {
            return;
        }

        if (remainingSegments.length === 0) {
            (targetData as any)[segment.name] = fieldValue;
        } else {
            if (!(targetData as any)[segment.name]) {
                (targetData as any)[segment.name] = Array.isArray(fieldValue) ? [] : {};
            }
            this.applyPatternToData(
                fieldValue,
                remainingSegments,
                (targetData as any)[segment.name],
                [...currentPath, segment.name]
            );
        }
    }

    private removePatternFromData(
        data: any,
        segments: PatternSegment[],
        currentPath: string[]
    ): any {
        if (segments.length === 0 || data === null || data === undefined) {
            return data;
        }

        const [currentSegment, ...remainingSegments] = segments;
        const dataCopy = this.deepClone(data);

        switch (currentSegment.type) {
            case SegmentType.FIELD:
                if (currentSegment.name && dataCopy && typeof dataCopy === 'object') {
                    if (remainingSegments.length === 0) {
                        delete dataCopy[currentSegment.name];
                    } else if (dataCopy[currentSegment.name]) {
                        dataCopy[currentSegment.name] = this.removePatternFromData(
                            dataCopy[currentSegment.name],
                            remainingSegments,
                            [...currentPath, currentSegment.name]
                        );
                    }
                }
                break;

            case SegmentType.WILDCARD:
                if (dataCopy && typeof dataCopy === 'object') {
                    for (const key of Object.keys(dataCopy)) {
                        if (remainingSegments.length === 0) {
                            delete dataCopy[key];
                        } else {
                            dataCopy[key] = this.removePatternFromData(
                                dataCopy[key],
                                remainingSegments,
                                [...currentPath, key]
                            );
                        }
                    }
                }
                break;
        }

        return dataCopy;
    }

    // ================================
    // UTILITY METHODS
    // ================================

    private pathMatches(fieldPath: string[], segments: PatternSegment[]): boolean {
        if (segments.length === 0) {
            return fieldPath.length === 0;
        }

        if (fieldPath.length === 0) {
            return false;
        }

        const [currentSegment, ...remainingSegments] = segments;
        const [currentField, ...remainingFields] = fieldPath;

        switch (currentSegment.type) {
            case SegmentType.FIELD:
                if (currentSegment.name === currentField) {
                    return this.pathMatches(remainingFields, remainingSegments);
                }
                return false;

            case SegmentType.WILDCARD:
                if (remainingSegments.length === 0) {
                    return true;
                }
                return this.pathMatches(remainingFields, remainingSegments);

            case SegmentType.DEEP_WILDCARD:
                return true;

            default:
                return false;
        }
    }

    private checkType(value: any, expectedType: string): boolean {
        switch (expectedType) {
            case 'str':
                return typeof value === 'string';
            case 'num':
                return typeof value === 'number' && !isNaN(value);
            case 'bool':
                return typeof value === 'boolean';
            case 'arr':
                return Array.isArray(value);
            case 'obj':
                return typeof value === 'object' && value !== null && !Array.isArray(value);
            default:
                return true;
        }
    }

    private deepClone(obj: any): any {
        if (obj === null || typeof obj !== 'object') {
            return obj;
        }

        if (Array.isArray(obj)) {
            return obj.map(item => this.deepClone(item));
        }

        const cloned: any = {};
        for (const [key, value] of Object.entries(obj)) {
            cloned[key] = this.deepClone(value);
        }

        return cloned;
    }

    private cleanup(data: any): any {
        if (data === null || data === undefined) {
            return data;
        }

        if (Array.isArray(data)) {
            return data.filter(item => item !== undefined).map(item => this.cleanup(item));
        }

        if (typeof data === 'object') {
            const cleaned: any = {};
            for (const [key, value] of Object.entries(data)) {
                if (value !== undefined) {
                    cleaned[key] = this.cleanup(value);
                }
            }
            return cleaned;
        }

        return data;
    }

    // ================================
    // DEBUG AND STATISTICS
    // ================================

    public getPatternComplexity(pattern: string): number {
        try {
            const compiled = this.compilePattern(pattern);
            return compiled.complexity;
        } catch {
            return -1;
        }
    }

    public getCacheStats(): { size: number, patterns: string[] } {
        return {
            size: this.compiledPatternCache.size,
            patterns: Array.from(this.compiledPatternCache.keys())
        };
    }

    public clearCache(): void {
        this.compiledPatternCache.clear();
    }

    public enableDebug(enabled: boolean = true): void {
        this.debugMode = enabled;
    }

    private debugLog(message: string, data?: any): void {
        if (this.debugMode) {
            console.log(`[RBAC Debug] ${message}`, data || '');
        }
    }
}

// ================================
// HELPER FUNCTIONS
// ================================

/**
 * Create a new RBACPatternHandler instance
 */
export function createRBACHandler(debugMode: boolean = false): RBACPatternHandler {
    return new RBACPatternHandler(debugMode);
}

/**
 * Quick validation function for patterns
 */
export function validateRBACPattern(pattern: string): { isValid: boolean, errors: string[] } {
    const handler = new RBACPatternHandler();
    const errors = handler.validatePattern(pattern);
    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * Quick check if pattern matches a path
 */
export function patternMatchesPath(
    pattern: string, 
    fieldPath: string, 
    context?: UserContext
): boolean {
    const handler = new RBACPatternHandler();
    return handler.matchesPath(pattern, fieldPath, context);
}

/**
 * Process data with patterns (simplified interface)
 */
export function processDataWithRBAC(
    data: any,
    patterns: string[],
    context: UserContext
): any {
    const handler = new RBACPatternHandler();
    const result = handler.process(data, patterns, context);
    return result.matched ? result.data : null;
}