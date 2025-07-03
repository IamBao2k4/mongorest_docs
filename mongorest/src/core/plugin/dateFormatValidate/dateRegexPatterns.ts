/**
 * Regular expression patterns for date validation and parsing
 */

export class DateRegexPatterns {
    /**
     * Regex pattern for ISO string format
     * Matches: 2025-01-01T12:00:00.000Z or 2025-01-01T12:00:00Z
     */
    static readonly ISO_STRING = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/;

    /**
     * Regex pattern for date string format
     * Matches: 2025-01-01
     */
    static readonly DATE_STRING = /^\d{4}-\d{2}-\d{2}$/;

    /**
     * Regex pattern for date-time string format
     * Matches: 2025-01-01T12:00:00.000 or 2025-01-01T12:00:00
     */
    static readonly DATE_TIME_STRING = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?$/;

    /**
     * Regex pattern for "Date.now() + x" expressions
     * Matches patterns like:
     * - Date.now() + 1000
     * - Date.now() + 7*24*60*60*1000
     * - Date.now() + 86400000
     */
    static readonly DATE_NOW_PLUS = /^Date\.now\(\)\s*\+\s*(\d+(?:\s*[\*\/\+\-]\s*\d+)*)$/;

    /**
     * Regex pattern for "Date.now() - x" expressions
     */
    static readonly DATE_NOW_MINUS = /^Date\.now\(\)\s*\-\s*(\d+(?:\s*[\*\/\+\-]\s*\d+)*)$/;

    /**
     * Regex pattern for any Date.now() mathematical expression
     */
    static readonly DATE_NOW_MATH = /^Date\.now\(\)\s*[\+\-]\s*(\d+(?:\s*[\*\/\+\-]\s*\d+)*)$/;

    /**
     * Test if a string matches the ISO string format
     */
    static isISOStringFormat(input: string): boolean {
        return this.ISO_STRING.test(input);
    }

    /**
     * Test if a string matches the date string format
     */
    static isDateStringFormat(input: string): boolean {
        return this.DATE_STRING.test(input);
    }

    /**
     * Test if a string matches the date-time string format
     */
    static isDateTimeStringFormat(input: string): boolean {
        return this.DATE_TIME_STRING.test(input);
    }

    /**
     * Test if a string matches the Date.now() + x pattern
     */
    static isDateNowPlusExpression(input: string): boolean {
        return this.DATE_NOW_PLUS.test(input);
    }

    /**
     * Test if a string matches the Date.now() - x pattern
     */
    static isDateNowMinusExpression(input: string): boolean {
        return this.DATE_NOW_MINUS.test(input);
    }

    /**
     * Test if a string matches any Date.now() mathematical expression
     */
    static isDateNowMathExpression(input: string): boolean {
        return this.DATE_NOW_MATH.test(input);
    }

    /**
     * Extract the mathematical expression from Date.now() + x pattern
     */
    static extractMathExpression(input: string): string | null {
        const match = input.match(this.DATE_NOW_MATH);
        return match ? match[1] : null;
    }

    /**
     * Get all patterns as an object
     */
    static getAllPatterns() {
        return {
            ISO_STRING: this.ISO_STRING,
            DATE_STRING: this.DATE_STRING,
            DATE_TIME_STRING: this.DATE_TIME_STRING,
            DATE_NOW_PLUS: this.DATE_NOW_PLUS,
            DATE_NOW_MINUS: this.DATE_NOW_MINUS,
            DATE_NOW_MATH: this.DATE_NOW_MATH
        };
    }
}

// Example usage and tests
if (require.main === module) {
    console.log("=== Date Regex Patterns Test ===");
    
    const testCases = [
        // Date.now() expressions
        "Date.now() + 7*24*60*60*1000",
        "Date.now() + 86400000",
        "Date.now() - 3600000",
        "Date.now() + 1000",
        "Date.now() - 60*60*1000",
        
        // Date format strings
        "2025-01-01T12:00:00.000Z",
        "2025-12-31T23:59:59Z",
        "2025-01-01",
        "2025-01-01T12:00:00.000",
        "2025-01-01T12:00:00",
        
        // Invalid patterns
        "Date.now() + invalid",
        "invalid pattern",
        "2025-13-01", // Invalid month
        "2025-01-32"  // Invalid day
    ];

    testCases.forEach(testCase => {
        console.log(`\nTesting: "${testCase}"`);
        console.log(`  - Is ISO String: ${DateRegexPatterns.isISOStringFormat(testCase)}`);
        console.log(`  - Is Date String: ${DateRegexPatterns.isDateStringFormat(testCase)}`);
        console.log(`  - Is DateTime String: ${DateRegexPatterns.isDateTimeStringFormat(testCase)}`);
        console.log(`  - Is Date.now() + x: ${DateRegexPatterns.isDateNowPlusExpression(testCase)}`);
        console.log(`  - Is Date.now() - x: ${DateRegexPatterns.isDateNowMinusExpression(testCase)}`);
        console.log(`  - Is Date.now() math: ${DateRegexPatterns.isDateNowMathExpression(testCase)}`);
        
        const mathExpr = DateRegexPatterns.extractMathExpression(testCase);
        if (mathExpr) {
            console.log(`  - Math expression: ${mathExpr}`);
        }
    });
}
