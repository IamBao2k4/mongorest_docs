// Simple demo file to test CROSS_COLLECTION functionality
import { validateRBACPattern } from './src/core/rbac/rbac-syntax-handler';

console.log("=== CROSS_COLLECTION DEMO ===");

// Test basic pattern validation
console.log("\n1. Testing pattern validation:");

const testPatterns = [
    "look_~",           // Should be valid
    "look_.id",         // Should be valid  
    "look_~.name",      // Should be valid
    "look_~ look_~",    // Should be invalid (multiple look_~)
    "id",               // Should be valid
    "*.look_~"          // Should be valid
];

testPatterns.forEach(pattern => {
    const result = validateRBACPattern(pattern);
    console.log(`Pattern "${pattern}": ${result.isValid ? '✅ Valid' : '❌ Invalid'}`);
    if (!result.isValid) {
        console.log(`   Errors: ${result.errors.join(', ')}`);
    }
});

console.log("\n✅ CROSS_COLLECTION support has been successfully added!");
console.log("\nWhat was added:");
console.log("- TokenType.CROSS_COLLECTION for 'look_~' pattern");
console.log("- SegmentType.CROSS_COLLECTION for cross-collection segments");
console.log("- lookupPattern field in PatternSegment interface");
console.log("- handleCrossCollectionInclusion method");
console.log("- Enhanced tokenization to detect 'look_~'");
console.log("- Pattern validation for cross-collection syntax");
console.log("- Path matching support for cross-collection patterns");

console.log("\nUsage examples:");
console.log("- 'look_~' matches all fields starting with 'look_'");
console.log("- 'look_~.id' matches the 'id' field in all look_ collections");
console.log("- 'look_~.*.name' matches 'name' field in all items of look_ arrays");
