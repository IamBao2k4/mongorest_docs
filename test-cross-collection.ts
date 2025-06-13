// Test file for CROSS_COLLECTION functionality
import { RBACPatternHandler } from './src/core/rbac/rbac-syntax-handler';
import { UserContext } from './src/core/rbac/rbac-syntax';

// Test data with look_ fields
const testData = [
    {
        id: 1,
        name: "Product 1",
        look_users: [{ id: 101, name: "User 1" }],
        look_categories: [{ id: 201, name: "Category 1" }],
        look_reviews: [{ id: 301, rating: 5 }],
        description: "A great product",
        regularField: "This should not match"
    },
    {
        id: 2,
        name: "Product 2", 
        look_users: [{ id: 102, name: "User 2" }],
        look_tags: [{ id: 401, name: "Tag 1" }],
        price: 29.99,
        anotherField: "This also should not match"
    }
];

console.log("=== CROSS_COLLECTION TESTING ===");
console.log("Input data:", JSON.stringify(testData, null, 2));

// Create handler with debug mode
const handler = new RBACPatternHandler(true);

// Test patterns
const patterns = [
    "id",           // Include id field
    "name",         // Include name field  
    "look_~"        // Include ALL fields starting with "look_"
];

const context: UserContext = { 
    userId: "user123", 
    teamId: "team456",
    roles: ["read"],
    isAdmin: false
};

console.log("\nPatterns:", patterns);
console.log("Context:", context);

// Test the processing
const result = handler.process(testData, patterns, context);

console.log("\n=== RESULT ===");
console.log("Success:", result.matched);
console.log("Errors:", result.errors);
console.log("Result data:", JSON.stringify(result.data, null, 2));

// Test individual pattern validation
console.log("\n=== PATTERN VALIDATION ===");
patterns.forEach(pattern => {
    const validation = handler.validatePattern(pattern);
    console.log(`Pattern "${pattern}":`, validation);
});

// Test path matching
console.log("\n=== PATH MATCHING TESTS ===");
const testPaths = [
    "look_users",
    "look_categories", 
    "look_reviews",
    "look_tags",
    "look_anything",
    "description",
    "regularField"
];

testPaths.forEach(path => {
    const matches = handler.matchesPath("look_~", path, context);
    console.log(`"look_~" matches "${path}":`, matches);
});

console.log("\n=== TOKENIZATION TEST ===");
try {
    // Test tokenization directly
    const compiledPattern = handler.debugCompilePattern("look_~");
    console.log("Compiled pattern for 'look_~':", JSON.stringify(compiledPattern, null, 2));
} catch (error) {
    console.log("Could not test tokenization directly:", (error as Error).message);
}
