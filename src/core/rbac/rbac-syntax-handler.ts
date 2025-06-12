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
// ENHANCED FIELD PATH TYPES
// ================================

interface ParsedFieldSegment {
    fieldName: string;
    arrayIndex?: number;
    isArrayAccess: boolean;
}

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
        const typeMatches = pattern.match(/(?<!\[[\d*]*):(\w+)(?![\d*]*\])/g);
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

            // Field name (with optional type check) - MODIFIED to accept numeric field names
            const fieldMatch = pattern.substring(position).match(/^[a-zA-Z_0-9][a-zA-Z0-9_]*(?::\w+)?/);
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

    private applyIncludes(data: Array<any>, includes: CompiledPattern[], context: UserContext): any {
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

        // Start with empty result and only include allowed fields
        const result :any = [];

        for (let i = 0; i < data.length; i++) {
            const temp = {};
            for (const pattern of includes) {
                const resolvedPattern = this.resolveContext(pattern, context);
                this.includePatternInResult(data[i], resolvedPattern.segments, temp, []);
            }
            result.push(temp);
        }

        return result;
    }

    /**
     * Include only the specified pattern in the result, creating the path if needed
     */
    private includePatternInResult(
        source: any, 
        segments: PatternSegment[], 
        target: any, 
        currentPath: string[]
    ): void {
        if (!source || segments.length === 0) {
            return;
        }
        const segment = segments[0];
        const remainingSegments = segments.slice(1);
        const isLastSegment = remainingSegments.length === 0;

        switch (segment.type) {
            case SegmentType.FIELD:
                this.handleFieldInclusion(source, target, segment.name, remainingSegments, currentPath);
                break;

            case SegmentType.WILDCARD:
                this.handleWildcardInclusion(source, target, remainingSegments, currentPath, isLastSegment);
                break;

            case SegmentType.ARRAY_INDEX:
                this.handleArrayIndexInclusion(source, target, segment, remainingSegments, currentPath);
                break;

            case SegmentType.ARRAY_RANGE:
                this.handleArrayRangeInclusion(source, target, segment, remainingSegments, currentPath);
                break;

            case SegmentType.DEEP_WILDCARD:
                this.handleDeepWildcardInclusion(source, target, currentPath);
                break;

            case SegmentType.TYPE_CHECK:
                this.handleTypeCheckInclusion(source, target, segment, remainingSegments, currentPath);
                break;

            case SegmentType.CONTEXT:
                // Context should already be resolved at this point
                break;
        }
    }

    private handleFieldInclusion(
        source: any, 
        target: any, 
        fieldName: string | undefined, 
        remainingSegments: PatternSegment[], 
        currentPath: string[]
    ): void {
        
        if (!fieldName || !(fieldName in source)) {
            return;
        }

        const sourceValue = source[fieldName];
        
        if (remainingSegments.length === 0) {
            // Last segment - copy the value
            if (Array.isArray(target)) {
                return;
            }
            target[fieldName] = this.deepClone(sourceValue);
        } else {
            // More segments to process
            if (!target[fieldName]) {
                target[fieldName] = Array.isArray(sourceValue) ? [] : {};
            }
            this.includePatternInResult(
                sourceValue, 
                remainingSegments, 
                target[fieldName], 
                [...currentPath, fieldName]
            );
        }
    }

    private handleWildcardInclusion(
        source: any, 
        target: any, 
        remainingSegments: PatternSegment[], 
        currentPath: string[],
        isLastSegment: boolean
    ): void {
        if (Array.isArray(source)) {
            // Handle array wildcard
            for (let i = 0; i < source.length; i++) {
                if (!target[i]) {
                    target[i] = Array.isArray(source[i]) ? [] : {};
                }

                if (isLastSegment) {
                    target[i] = this.deepClone(source[i]);
                } else {
                    this.includePatternInResult(
                        source[i], 
                        remainingSegments, 
                        target[i], 
                        [...currentPath, i.toString()]
                    );
                }
            }
        } else if (source && typeof source === 'object') {
            // Handle object wildcard
            for (const key in source) {
                if (source.hasOwnProperty(key)) {
                    if (isLastSegment) {
                        target[key] = this.deepClone(source[key]);
                    } else {
                        if (!target[key]) {
                            target[key] = Array.isArray(source[key]) ? [] : {};
                        }
                        
                        this.includePatternInResult(
                            source[key], 
                            remainingSegments, 
                            target[key], 
                            [...currentPath, key]
                        );
                    }
                }
            }
        }
    }

    private handleArrayIndexInclusion(
        source: any, 
        target: any, 
        segment: PatternSegment, 
        remainingSegments: PatternSegment[], 
        currentPath: string[]
    ): void {
        if (!Array.isArray(source) || segment.index === undefined) {
            return;
        }

        const index = segment.index < 0 ? source.length + segment.index : segment.index;
        if (index < 0 || index >= source.length) {
            return;
        }

        const sourceItem = source[index];

        if (remainingSegments.length === 0) {
            // Last segment - add to target array
            if (Array.isArray(target)) {
                target.push(this.deepClone(sourceItem));
            } else {
                target[index] = this.deepClone(sourceItem);
            }
        } else {
            // More segments to process
            let targetItem;
            if (Array.isArray(target)) {
                targetItem = Array.isArray(sourceItem) ? [] : {};
                target.push(targetItem);
            } else {
                if (!target[index]) {
                    target[index] = Array.isArray(sourceItem) ? [] : {};
                }
                targetItem = target[index];
            }
            
            this.includePatternInResult(
                sourceItem, 
                remainingSegments, 
                targetItem, 
                [...currentPath, index.toString()]
            );
        }
    }

    private handleArrayRangeInclusion(
        source: any, 
        target: any, 
        segment: PatternSegment, 
        remainingSegments: PatternSegment[], 
        currentPath: string[]
    ): void {
        if (!Array.isArray(source)) {
            return;
        }

        const { start = 0, end = source.length } = { start: segment.start, end: segment.end };
        const actualStart = Math.max(0, start);
        const actualEnd = Math.min(source.length, end);

        for (let i = actualStart; i < actualEnd; i++) {
            const sourceItem = source[i];
            
            if (remainingSegments.length === 0) {
                // Last segment - add to target array
                if (Array.isArray(target)) {
                    target.push(this.deepClone(sourceItem));
                } else {
                    target[i] = this.deepClone(sourceItem);
                }
            } else {
                // More segments to process
                let targetItem;
                if (Array.isArray(target)) {
                    targetItem = Array.isArray(sourceItem) ? [] : {};
                    target.push(targetItem);
                } else {
                    if (!target[i]) {
                        target[i] = Array.isArray(sourceItem) ? [] : {};
                    }
                    targetItem = target[i];
                }
                
                this.includePatternInResult(
                    sourceItem, 
                    remainingSegments, 
                    targetItem, 
                    [...currentPath, i.toString()]
                );
            }
        }
    }

    private handleDeepWildcardInclusion(
        source: any, 
        target: any, 
        currentPath: string[]
    ): void {
        if (currentPath.length > MAX_NESTING_DEPTH) {
            return;
        }

        // Deep wildcard copies everything
        if (Array.isArray(source)) {
            for (let i = 0; i < Math.min(source.length, MAX_ARRAY_SIZE); i++) {
                target[i] = this.deepClone(source[i]);
            }
        } else if (source && typeof source === 'object') {
            for (const [key, value] of Object.entries(source)) {
                target[key] = this.deepClone(value);
            }
        }
    }

    private handleTypeCheckInclusion(
        source: any, 
        target: any, 
        segment: PatternSegment, 
        remainingSegments: PatternSegment[], 
        currentPath: string[]
    ): void {
        if (!source || typeof source !== 'object' || !segment.name || !segment.dataType) {
            return;
        }

        const fieldValue = source[segment.name];
        if (!this.checkType(fieldValue, segment.dataType)) {
            return;
        }

        if (remainingSegments.length === 0) {
            target[segment.name] = this.deepClone(fieldValue);
        } else {
            if (!target[segment.name]) {
                target[segment.name] = Array.isArray(fieldValue) ? [] : {};
            }
            
            this.includePatternInResult(
                fieldValue, 
                remainingSegments, 
                target[segment.name], 
                [...currentPath, segment.name]
            );
        }
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

    /**
     * MODIFIED: Enhanced wildcard handling - if no remaining segments, copy entire subtree
     */
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

        // MODIFIED: If this is the last segment (no remaining segments),
        // copy the entire subtree for each matched field (like deep wildcard behavior)
        if (remainingSegments.length === 0) {
            for (const [key, value] of Object.entries(sourceData)) {
                // Copy the entire value (including all nested data) using deep clone
                (targetData as any)[key] = this.deepClone(value);
            }
            return;
        }

        // Original behavior: continue processing with remaining segments (only one level)
        for (const [key, value] of Object.entries(sourceData)) {
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

    /**
     * MODIFIED: Enhanced array wildcard handling - if no remaining segments, copy entire array items
     */
    private handleArrayWildcardSegment(
        sourceData: any,
        remainingSegments: PatternSegment[],
        targetData: any,
        currentPath: string[]
    ): void {
        if (!Array.isArray(sourceData)) {
            return;
        }

        // MODIFIED: If this is the last segment, copy entire array items (deep clone)
        if (remainingSegments.length === 0) {
            for (let i = 0; i < Math.min(sourceData.length, MAX_ARRAY_SIZE); i++) {
                (targetData as any)[i] = this.deepClone(sourceData[i]);
            }
            return;
        }

        // Original behavior: continue processing with remaining segments
        for (let i = 0; i < Math.min(sourceData.length, MAX_ARRAY_SIZE); i++) {
            const item = sourceData[i];
            
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
                // For final values, push to create compact array
                targetData.push(item);
            } else {
                // For intermediate processing, create new object/array for each item
                const newTarget = Array.isArray(item) ? [] : {};
                this.applyPatternToData(
                    item,
                    remainingSegments,
                    newTarget,
                    [...currentPath, i.toString()]
                );
                
                // Only add non-empty results
                if (Array.isArray(newTarget) ? newTarget.length > 0 : Object.keys(newTarget).length > 0) {
                    targetData.push(newTarget);
                }
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
    // ENHANCED FIELD PATH PARSING
    // ================================

    /**
     * Parse field path segment to extract field name and array index
     * MODIFIED: Now treats numeric strings as regular field names by default
     * Examples:
     * - "reviews" → { fieldName: "reviews", isArrayAccess: false }
     * - "reviews[0]" → { fieldName: "reviews", arrayIndex: 0, isArrayAccess: true }
     * - "0" → { fieldName: "0", isArrayAccess: false } (treat as field name)
     * - "tags[5]" → { fieldName: "tags", arrayIndex: 5, isArrayAccess: true }
     */
    private parseFieldSegment(fieldSegment: string): ParsedFieldSegment {
        // Check for array access pattern: fieldName[index]
        const arrayMatch = fieldSegment.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\[(\d+)\]$/);
        
        if (arrayMatch) {
            return {
                fieldName: arrayMatch[1],
                arrayIndex: parseInt(arrayMatch[2]),
                isArrayAccess: true
            };
        }
        
        // MODIFIED: Accept any field name including pure numbers
        // This allows "0", "1", "2" etc. to be treated as field names
        if (/^[a-zA-Z_0-9][a-zA-Z0-9_]*$/.test(fieldSegment)) {
            return {
                fieldName: fieldSegment,
                isArrayAccess: false
            };
        }
        
        throw new Error(`Invalid field segment: ${fieldSegment}`);
    }

    /**
    * Check if a pattern segment matches a parsed field segment
    */
   private segmentMatches(
       patternSegment: PatternSegment,
       parsedField: ParsedFieldSegment
   ): boolean {
       switch (patternSegment.type) {
           case SegmentType.FIELD:
               // Simple field name match (no array access)
               return !parsedField.isArrayAccess && 
                      patternSegment.name === parsedField.fieldName;
           
           case SegmentType.ARRAY_INDEX:
               // Exact array index match
               return parsedField.isArrayAccess && 
                      parsedField.arrayIndex === patternSegment.index;
           
           case SegmentType.ARRAY_RANGE:
               // Array range contains the field's array index
               if (!parsedField.isArrayAccess || parsedField.arrayIndex === undefined) {
                   return false;
               }
               
               const start = patternSegment.start ?? 0;
               const end = patternSegment.end ?? Number.MAX_SAFE_INTEGER;
               
               return parsedField.arrayIndex >= start && parsedField.arrayIndex < end;
           
           case SegmentType.WILDCARD:
               // Wildcard matches any single field (with or without array access)
               return true;
           
           case SegmentType.DEEP_WILDCARD:
               // Deep wildcard matches everything
               return true;
           
           case SegmentType.TYPE_CHECK:
               // Type check with optional array access
               return patternSegment.name === parsedField.fieldName;
           
           default:
               return false;
       }
   }

   /**
    * Check if a pattern segment is an array-related segment
    */
   private isArraySegment(segment: PatternSegment): boolean {
       return segment.type === SegmentType.ARRAY_INDEX ||
              segment.type === SegmentType.ARRAY_RANGE ||
              segment.type === SegmentType.ARRAY_WILDCARD;
   }

   // ================================
   // UTILITY METHODS
   // ================================

   /**
    * MODIFIED: Enhanced pathMatches method with terminal wildcard support
    * Key changes:
    * - If WILDCARD (*) is the last segment, it matches any remaining path segments
    * - This allows "images.public.*" to match "images.public.0", "images.public.0.url", etc.
    */
   private pathMatches(fieldPath: string[], segments: PatternSegment[]): boolean {
       // Base cases
       if (segments.length === 0) {
           return fieldPath.length === 0;
       }
       
       if (fieldPath.length === 0) {
           // Check if remaining segments are all optional or deep wildcards
           return segments.every(seg => 
               seg.type === SegmentType.DEEP_WILDCARD ||
               seg.isOptional
           );
       }

       const [currentField, ...remainingFields] = fieldPath;
       const [currentSegment, ...remainingSegments] = segments;

       try {
           // Parse current field segment
           const parsedField = this.parseFieldSegment(currentField);
           
           // Handle different pattern segment types
           switch (currentSegment.type) {
               case SegmentType.FIELD:
                   // For FIELD patterns, we need to handle the case where
                   // the field might have array access that needs to be matched
                   // by the NEXT pattern segment
                   if (parsedField.fieldName === currentSegment.name) {
                       if (parsedField.isArrayAccess) {
                           // Field has array access, next pattern segment should handle it
                           if (remainingSegments.length === 0) {
                               // No more pattern segments to handle array access
                               return false;
                           }
                           
                           const nextSegment = remainingSegments[0];
                           if (this.isArraySegment(nextSegment)) {
                               // Create a virtual parsed field for array index matching
                               const arrayField: ParsedFieldSegment = {
                                   fieldName: '',
                                   arrayIndex: parsedField.arrayIndex,
                                   isArrayAccess: true
                               };
                               
                               if (this.segmentMatches(nextSegment, arrayField)) {
                                   // Both field name and array index matched
                                   return this.pathMatches(remainingFields, remainingSegments.slice(1));
                               }
                           }
                           return false;
                       } else {
                           // Simple field name match, continue with remaining
                           return this.pathMatches(remainingFields, remainingSegments);
                       }
                   }
                   return false;
               
               case SegmentType.ARRAY_INDEX:
               case SegmentType.ARRAY_RANGE:
                   // Direct array segment matching
                   if (this.segmentMatches(currentSegment, parsedField)) {
                       return this.pathMatches(remainingFields, remainingSegments);
                   }
                   return false;
               
               case SegmentType.WILDCARD:
                   // MODIFIED: Enhanced wildcard behavior for terminal wildcards
                   // If this is the last segment in the pattern (no remaining segments),
                   // then it should match any remaining path segments (including multiple levels)
                   if (remainingSegments.length === 0) {
                       // Terminal wildcard matches any remaining path
                       // This allows "images.public.*" to match "images.public.0", "images.public.anything", etc.
                       return true;
                   }
                   
                   // Non-terminal wildcard: matches current field and continues with remaining segments
                   return this.pathMatches(remainingFields, remainingSegments);
               
               case SegmentType.DEEP_WILDCARD:
                   // Deep wildcard can match multiple fields
                   // Try matching with remaining segments at each position
                   for (let i = 0; i <= remainingFields.length; i++) {
                       if (this.pathMatches(remainingFields.slice(i), remainingSegments)) {
                           return true;
                       }
                   }
                   return false;
               
               case SegmentType.TYPE_CHECK:
                   // Type check with field name matching
                   if (this.segmentMatches(currentSegment, parsedField)) {
                       return this.pathMatches(remainingFields, remainingSegments);
                   }
                   return false;
               
               default:
                   return false;
           }
           
       } catch (error) {
           // Invalid field segment format
           if (this.debugMode) {
               this.debugLog(`Field parsing error: ${error instanceof Error ? error.message : String(error)}`);
           }
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
    // DEBUG METHODS (temporarily public for debugging)
    // ================================

    public debugCompilePattern(pattern: string): CompiledPattern {
        return this.compilePattern(pattern);
    }

    public debugSeparatePatterns(patterns: CompiledPattern[]): { includes: CompiledPattern[], excludes: CompiledPattern[] } {
        return this.separatePatterns(patterns);
    }

    public debugApplyIncludes(data: any, includes: CompiledPattern[], context: UserContext): any {
        console.log('[DEBUG] applyIncludes called with:');
        console.log('  Data:', JSON.stringify(data, null, 2));
        console.log('  Includes count:', includes.length);
        console.log('  Includes:', includes.map(inc => ({
            segments: inc.segments,
            isNegation: inc.isNegation,
            hasContext: inc.hasContext
        })));
        console.log('  Context:', context);
        
        const result = this.applyIncludes(data, includes, context);
        
        console.log('[DEBUG] applyIncludes result:', JSON.stringify(result, null, 2));
        return result;
    }

    public debugIncludePatternInResult(
        source: any, 
        segments: PatternSegment[], 
        target: any, 
        currentPath: string[]
    ): void {
        console.log('[DEBUG] includePatternInResult called with:');
        console.log('  Source:', JSON.stringify(source, null, 2));
        console.log('  Segments:', segments);
        console.log('  Target before:', JSON.stringify(target, null, 2));
        console.log('  Current path:', currentPath);
        
        this.includePatternInResult(source, segments, target, currentPath);
        
        console.log('  Target after:', JSON.stringify(target, null, 2));
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