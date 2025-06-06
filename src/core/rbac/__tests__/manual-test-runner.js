const { RBACPatternHandler } = require('../rbac-syntax-handler.ts');

async function runAllTests() {
    console.log('🚀 RBAC Syntax Handler - Manual Test Runner');
    console.log('=' .repeat(50));
    
    const handler = new RBACPatternHandler(true);
    const context = {
        userId: "user123",
        teamId: "team456",
        roles: ["user"],
        isAdmin: false
    };

    let passedTests = 0;
    let totalTests = 0;

    function test(name, testFn) {
        totalTests++;
        try {
            console.log(`\n🧪 ${name}`);
            testFn();
            console.log(`✅ PASSED`);
            passedTests++;
        } catch (error) {
            console.log(`❌ FAILED: ${error.message}`);
        }
    }

    function assertEqual(actual, expected, message = '') {
        if (JSON.stringify(actual) !== JSON.stringify(expected)) {
            throw new Error(`${message}\nExpected: ${JSON.stringify(expected)}\nActual: ${JSON.stringify(actual)}`);
        }
    }

    function assertTrue(condition, message = '') {
        if (!condition) {
            throw new Error(message || 'Expected condition to be true');
        }
    }

    // ================================
    // TEST CASES
    // ================================

    test('Basic Field Access', () => {
        const data = { name: "John", age: 30 };
        const result = handler.process(data, ['name'], context);
        assertTrue(result.matched, 'Should match successfully');
        assertEqual(result.data, { name: "John" }, 'Should return correct data');
    });

    test('Nested Field Access', () => {
        const data = { profile: { name: "John", age: 30 } };
        const result = handler.process(data, ['profile.name'], context);
        assertTrue(result.matched, 'Should match successfully');
        assertEqual(result.data, { profile: { name: "John" } }, 'Should return nested data');
    });

    test('Array Wildcard', () => {
        const data = { books: [{ title: "Book 1" }, { title: "Book 2" }] };
        const result = handler.process(data, ['books.*.title'], context);
        assertTrue(result.matched, 'Should match successfully');
        assertEqual(result.data.books.length, 2, 'Should return both books');
        assertEqual(result.data.books[0], { title: "Book 1" }, 'Should return first book');
    });

    test('Object Wildcard', () => {
        const data = { profile: { name: "John", age: 30, email: "john@example.com" } };
        const result = handler.process(data, ['profile.*'], context);
        assertTrue(result.matched, 'Should match successfully');
        assertTrue(Object.keys(result.data.profile).length === 3, 'Should return all profile fields');
    });

    test('Array Index Access', () => {
        const data = { items: [{ name: "Item 1" }, { name: "Item 2" }, { name: "Item 3" }] };
        const result = handler.process(data, ['items[1].name'], context);
        assertTrue(result.matched, 'Should match successfully');
        assertEqual(result.data.items[0], { name: "Item 2" }, 'Should return second item');
    });

    test('Array Range Access', () => {
        const data = { items: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }] };
        const result = handler.process(data, ['items[1:3].id'], context);
        assertTrue(result.matched, 'Should match successfully');
        assertTrue(result.data.items.length === 2, 'Should return range of items');
    });

    test('Type Checking - String', () => {
        const data = { name: "John", age: 30 };
        const result = handler.process(data, ['name:str'], context);
        assertTrue(result.matched, 'Should match successfully');
        assertEqual(result.data, { name: "John" }, 'Should return string field');
    });

    test('Type Checking - Number', () => {
        const data = { name: "John", age: 30 };
        const result = handler.process(data, ['age:num'], context);
        assertTrue(result.matched, 'Should match successfully');
        assertEqual(result.data, { age: 30 }, 'Should return number field');
    });

    test('Type Checking - Wrong Type', () => {
        const data = { name: "John", age: 30 };
        const result = handler.process(data, ['name:num'], context);
        assertTrue(result.matched, 'Should match but return empty');
        assertEqual(result.data, {}, 'Should return empty object for wrong type');
    });

    test('Context Resolution - Self', () => {
        const data = { 
            user123: { profile: { name: "John" } },
            user456: { profile: { name: "Jane" } }
        };
        const result = handler.process(data, ['@self.profile.name'], context);
        assertTrue(result.matched, 'Should match successfully');
        assertEqual(result.data.user123.profile.name, "John", 'Should return current user data');
    });

    test('Multiple Patterns', () => {
        const data = { name: "John", age: 30, profile: { city: {name: "Ho Chi Minh", code: 11111} } };
        const result = handler.process(data, ['name', 'profile.city.*'], context);
        assertTrue(result.matched, 'Should match successfully');
        assertEqual(result.data, { 
            name: "John", 
            profile: { city: {name: "Ho Chi Minh", code: 11111} }
        }, 'Should return multiple fields');
    });

    test('Exclusion Pattern', () => {
        const data = { profile: { name: "John", age: 30, password: "secret" } };
        const result = handler.process(data, ['profile.*', '!profile.password'], context);
        assertTrue(result.matched, 'Should match successfully');
        assertTrue(result.data.profile.name === "John", 'Should include name');
        assertTrue(result.data.profile.age === 30, 'Should include age');
        assertTrue(result.data.profile.password === undefined, 'Should exclude password');
    });

    test('Pattern Validation - Valid', () => {
        const errors = handler.validatePattern('profile.name');
        assertTrue(errors.length === 0, 'Valid pattern should have no errors');
    });

    test('Pattern Validation - Invalid', () => {
        const errors = handler.validatePattern('.invalid.pattern');
        assertTrue(errors.length > 0, 'Invalid pattern should have errors');
    });

    test('Complex Nested Pattern', () => {
        const data = {
            users: [
                {
                    profile: { name: "John" },
                    orders: [
                        { items: [{ product: { name: "Product 1" } }] }
                    ]
                }
            ]
        };
        const result = handler.process(data, ['users.*.orders.*.items.*.product.name'], context);
        assertTrue(result.matched, 'Should match successfully');
        assertEqual(
            result.data.users[0].orders[0].items[0].product.name, 
            "Product 1", 
            'Should access deeply nested data'
        );
    });

    test('Performance - Moderate Dataset', () => {
        const data = [];
        for (let i = 0; i < 100; i++) {
            data.push({ id: i, name: `User ${i}`, profile: { age: 20 + i } });
        }
        
        const startTime = Date.now();
        const result = handler.process({ users: data }, ['users.*.name'], context);
        const endTime = Date.now();
        
        assertTrue(result.matched, 'Should match successfully');
        assertTrue(endTime - startTime < 200, `Should complete within 200ms (took ${endTime - startTime}ms)`);
    });

    test('Cache Functionality', () => {
        const pattern = 'test.cache.pattern';
        
        // First access
        handler.getPatternComplexity(pattern);
        const stats1 = handler.getCacheStats();
        
        // Second access (should use cache)
        handler.getPatternComplexity(pattern);
        const stats2 = handler.getCacheStats();
        
        assertTrue(stats1.size === stats2.size, 'Cache size should remain same on second access');
        assertTrue(stats1.patterns.includes(pattern), 'Pattern should be in cache');
    });

    // ================================
    // REAL-WORLD SCENARIOS
    // ================================

    test('E-commerce Customer Data', () => {
        const customerData = {
            profile: { name: "John", email: "john@example.com" },
            orders: [
                {
                    orderNumber: "ORD-001",
                    items: [{ product: { name: "Laptop", price: 1000 } }],
                    total: 1000
                }
            ]
        };

        const customerPatterns = [
            'profile.name',
            'orders.*.orderNumber',
            'orders.*.items.*.product.name'
        ];

        const result = handler.process(customerData, customerPatterns, context);
        assertTrue(result.matched, 'Should match e-commerce data');
        assertTrue(result.data.profile.name === "John", 'Should include customer name');
        assertTrue(result.data.orders[0].orderNumber === "ORD-001", 'Should include order number');
    });

    test('Social Media Post Data', () => {
        const postData = {
            posts: [
                {
                    content: "Hello world!",
                    author: { name: "John", avatar: "avatar.jpg" },
                    comments: [{ text: "Nice post!", user: { name: "Jane" } }],
                    likes: { count: 10 }
                }
            ]
        };

        const publicPatterns = [
            'posts.*.content',
            'posts.*.author.name',
            'posts.*.likes.count'
        ];

        const result = handler.process(postData, publicPatterns, context);
        assertTrue(result.matched, 'Should match social media data');
        assertTrue(result.data.posts[0].content === "Hello world!", 'Should include post content');
        assertTrue(result.data.posts[0].likes.count === 10, 'Should include like count');
    });

    // ================================
    // RESULTS
    // ================================

    console.log('\n' + '='.repeat(50));
    console.log(`📊 Test Results: ${passedTests}/${totalTests} passed`);
    
    if (passedTests === totalTests) {
        console.log('🎉 All tests passed! RBAC Syntax Handler is working correctly.');
    } else {
        console.log(`⚠️  ${totalTests - passedTests} tests failed. Please check the implementation.`);
    }

    // Performance stats
    console.log('\n📈 Performance Stats:');
    const stats = handler.getCacheStats();
    console.log(`Cache size: ${stats.size} patterns`);
    console.log(`Cached patterns: ${stats.patterns.join(', ')}`);
    
    return passedTests === totalTests;
}

// Run tests if this file is executed directly
if (require.main === module) {
    runAllTests().then(success => {
        process.exit(success ? 0 : 1);
    }).catch(error => {
        console.error('❌ Test runner failed:', error);
        process.exit(1);
    });
}

module.exports = { runAllTests };