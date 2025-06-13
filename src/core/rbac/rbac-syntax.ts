// ================================
// TYPES AND INTERFACES
// ================================

export interface Token {
    type: TokenType;
    value: string;
    position: number;
}

export enum TokenType {
    FIELD = 'FIELD',
    DOT = 'DOT',
    WILDCARD = 'WILDCARD',
    DEEP_WILDCARD = 'DEEP_WILDCARD',
    ARRAY_INDEX = 'ARRAY_INDEX',
    ARRAY_RANGE = 'ARRAY_RANGE',
    NEGATION = 'NEGATION',
    CONTEXT = 'CONTEXT',
    TYPE_CHECK = 'TYPE_CHECK',
    OPTIONAL = 'OPTIONAL',
    LPAREN = 'LPAREN',
    RPAREN = 'RPAREN',
    LBRACE = 'LBRACE',
    RBRACE = 'RBRACE',
    AND = 'AND',
    OR = 'OR',
    COMMA = 'COMMA',
    PIPE = 'PIPE',
    LOOK = 'LOOK',
    CROSS_COLLECTION = 'CROSS_COLLECTION',
}

export interface PatternSegment {
    type: SegmentType;
    name?: string;
    index?: number;
    start?: number;
    end?: number;
    dataType?: string;
    isOptional?: boolean;
    isNegation?: boolean;
    context?: string;
    lookupPattern?: string;  // NEW: For cross-collection patterns
}

export enum SegmentType {
    FIELD = 'FIELD',
    WILDCARD = 'WILDCARD',
    DEEP_WILDCARD = 'DEEP_WILDCARD',
    ARRAY_WILDCARD = 'ARRAY_WILDCARD',
    ARRAY_INDEX = 'ARRAY_INDEX',
    ARRAY_RANGE = 'ARRAY_RANGE',
    CONTEXT = 'CONTEXT',
    TYPE_CHECK = 'TYPE_CHECK',
    CROSS_COLLECTION = 'CROSS_COLLECTION',
}

export interface CompiledPattern {
    segments: PatternSegment[];
    isNegation: boolean;
    hasContext: boolean;
    complexity: number;
}

export interface UserContext {
    userId: string;
    teamId?: string;
    roles: string[];
    isAdmin: boolean;
    permissions?: string[];
}

export interface ProcessingResult {
    data: any;
    matched: boolean;
    errors: string[];
}