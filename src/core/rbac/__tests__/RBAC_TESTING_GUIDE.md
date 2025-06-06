# RBAC Syntax Handler Testing Guide

*Comprehensive testing methodology for RBAC Pattern Syntax Handler*

---

## 🧪 Testing Strategy Overview

### Test Categories
1. **Unit Tests** - Individual function testing
2. **Integration Tests** - Component interaction testing
3. **Performance Tests** - Load and complexity testing
4. **Security Tests** - Permission and access validation
5. **Edge Case Tests** - Boundary condition testing

---

## 📋 Test Plan Structure

### 1. **Pattern Validation Tests**

#### A. Valid Pattern Tests
```typescript
const validPatterns = [
    'name',                           // Simple field
    'profile.name',                   // Nested field
    'profile.*',                      // Object wildcard
    'books.*.title',                  // Array wildcard
    'orders[0].total',               // Array index
    'items[1:5].name',               // Array range
    '@self.profile.*',               // Context pattern
    'profile.age:num',               // Type check
    'profile.**',                    // Deep wildcard
    '!profile.password',             // Negation
    '@team.projects.*.name'          // Complex context
];
```

#### B. Invalid Pattern Tests
```typescript
const invalidPatterns = [
    '.profile.name',                 // Starts with dot
    'profile.',                      // Ends with dot
    'profile..name',                 // Double dots
    'books.[].title',                // Empty brackets
    '@invalid.field',                // Invalid context
    'profile.age:invalid',           // Invalid type
    'profile[',                      // Unclosed bracket
    'profile.name:',                 // Empty type
];
```

### 2. **Data Processing Tests**

#### A. Basic Field Access
```typescript
const testData = {
    _id: "123",
    name: "John Doe",
    email: "john@example.com",
    profile: {
        age: 30,
        city: "Ho Chi Minh",
        preferences: {
            theme: "dark",
            language: "vi"
        }
    }
};

// Test Cases
testFieldAccess('name', testData, { name: "John Doe" });
testFieldAccess('profile.age', testData, { profile: { age: 30 } });
testFieldAccess('profile.preferences.theme', testData, { 
    profile: { preferences: { theme: "dark" } } 
});
```

#### B. Array Processing
```typescript
const arrayTestData = {
    books: [
        { title: "Book 1", author: "Author 1", price: 20 },
        { title: "Book 2", author: "Author 2", price: 30 }
    ],
    tags: ["javascript", "mongodb", "nodejs"]
};

// Test Cases
testArrayAccess('books.*.title', arrayTestData);
testArrayAccess('books[0].author', arrayTestData);
testArrayAccess('books[0:1].price', arrayTestData);
testArrayAccess('tags', arrayTestData);
```

#### C. Wildcard Tests
```typescript
const wildcardTestData = {
    profile: {
        name: "John",
        age: 30,
        email: "john@example.com",
        address: {
            street: "123 Main St",
            city: "Ho Chi Minh"
        }
    }
};

// Test Cases
testWildcard('profile.*', wildcardTestData);
testWildcard('profile.**', wildcardTestData);
```

### 3. **Context Resolution Tests**

#### A. Self Context
```typescript
const userContext = {
    userId: "user123",
    teamId: "team456",
    roles: ["user"],
    isAdmin: false
};

const contextTestData = {
    user123: { profile: { name: "John" } },
    user456: { profile: { name: "Jane" } }
};

// Test Cases
testContext('@self.profile.*', contextTestData, userContext);
```

#### B. Team Context
```typescript
const teamTestData = {
    team456: { 
        projects: [
            { name: "Project 1", status: "active" },
            { name: "Project 2", status: "completed" }
        ]
    }
};

testContext('@team.projects.*.name', teamTestData, userContext);
```

### 4. **Type Checking Tests**

```typescript
const typeTestData = {
    name: "John",           // string
    age: 30,               // number
    isActive: true,        // boolean
    tags: ["a", "b"],      // array
    profile: { x: 1 }      // object
};

// Test Cases
testTypeCheck('name:str', typeTestData, true);
testTypeCheck('age:num', typeTestData, true);
testTypeCheck('isActive:bool', typeTestData, true);
testTypeCheck('tags:arr', typeTestData, true);
testTypeCheck('profile:obj', typeTestData, true);

// Negative tests
testTypeCheck('name:num', typeTestData, false);
testTypeCheck('age:str', typeTestData, false);
```

### 5. **Performance Tests**

#### A. Complexity Measurement
```typescript
const performanceTests = [
    { pattern: 'name', expectedComplexity: 1 },
    { pattern: 'profile.*', expectedComplexity: 4 },
    { pattern: 'books.*.author.profile.**', expectedComplexity: 12 }
];
```

#### B. Large Dataset Tests
```typescript
const largeDataset = generateLargeTestData(1000); // 1000 objects
const complexPatterns = [
    'users.*.profile.address.coordinates.*',
    'orders.*.items.*.product.reviews.*.user.profile.name'
];

// Performance benchmarks
testPerformance(largeDataset, complexPatterns);
```

### 6. **Security Tests**

#### A. Permission Bypass Tests
```typescript
const restrictedData = {
    profile: {
        name: "John",
        email: "john@example.com",
        password: "secret123",
        ssn: "123-45-6789"
    }
};

// Test malicious patterns
const maliciousPatterns = [
    '../profile.password',
    'profile.*',  // Should not include password
    '!profile.name', // Invalid negation
];

testSecurity(restrictedData, maliciousPatterns);
```

---

## 🛠️ Test Implementation

### Test Framework Setup

```typescript
// rbac-syntax-handler.test.ts
import { 
    RBACPatternHandler, 
    validateRBACPattern, 
    processDataWithRBAC 
} from './rbac-syntax-handler';

describe('RBAC Syntax Handler', () => {
    let handler: RBACPatternHandler;
    
    beforeEach(() => {
        handler = new RBACPatternHandler(true); // Enable debug mode
    });

    afterEach(() => {
        handler.clearCache();
    });
});
```

### Core Test Functions

```typescript
// Test helper functions
function testFieldAccess(pattern: string, data: any, expected: any) {
    const result = handler.process(data, [pattern], mockUserContext);
    expect(result.data).toEqual(expected);
    expect(result.matched).toBe(true);
    expect(result.errors).toHaveLength(0);
}

function testArrayAccess(pattern: string, data: any) {
    const result = handler.process(data, [pattern], mockUserContext);
    expect(result.matched).toBe(true);
    expect(result.errors).toHaveLength(0);
    // Verify array structure preserved
    if (Array.isArray(result.data)) {
        expect(Array.isArray(result.data)).toBe(true);
    }
}

function testWildcard(pattern: string, data: any) {
    const result = handler.process(data, [pattern], mockUserContext);
    expect(result.matched).toBe(true);
    
    // Verify all expected fields are included
    const originalKeys = getAllKeys(data, pattern);
    const resultKeys = getAllKeys(result.data, pattern);
    expect(resultKeys).toEqual(expect.arrayContaining(originalKeys));
}

function testContext(pattern: string, data: any, context: UserContext) {
    const result = handler.process(data, [pattern], context);
    expect(result.matched).toBe(true);
    
    // Verify context resolution worked
    const resolvedPattern = resolveExpectedPattern(pattern, context);
    expect(result.data).toMatchSnapshot();
}

function testTypeCheck(pattern: string, data: any, shouldMatch: boolean) {
    const result = handler.process(data, [pattern], mockUserContext);
    expect(result.matched).toBe(shouldMatch);
    
    if (shouldMatch) {
        expect(Object.keys(result.data)).toHaveLength(1);
    } else {
        expect(result.data).toEqual({});
    }
}

function testPerformance(data: any, patterns: string[]) {
    const startTime = performance.now();
    const result = handler.process(data, patterns, mockUserContext);
    const endTime = performance.now();
    
    const executionTime = endTime - startTime;
    expect(executionTime).toBeLessThan(1000); // Should complete within 1 second
    expect(result.matched).toBe(true);
}

function testSecurity(data: any, maliciousPatterns: string[]) {
    for (const pattern of maliciousPatterns) {
        const errors = handler.validatePattern(pattern);
        expect(errors.length).toBeGreaterThan(0); // Should have validation errors
        
        const result = handler.process(data, [pattern], mockUserContext);
        expect(result.matched).toBe(false); // Should fail processing
    }
}
```

### Mock Data Generators

```typescript
// Generate test data
function generateLargeTestData(count: number) {
    const data = [];
    for (let i = 0; i < count; i++) {
        data.push({
            id: `user_${i}`,
            profile: {
                name: `User ${i}`,
                email: `user${i}@example.com`,
                address: {
                    street: `${i} Main St`,
                    city: "Ho Chi Minh",
                    coordinates: {
                        lat: 10.0 + (i * 0.001),
                        lng: 106.0 + (i * 0.001)
                    }
                }
            },
            orders: generateOrders(Math.floor(Math.random() * 5))
        });
    }
    return data;
}

function generateOrders(count: number) {
    const orders = [];
    for (let i = 0; i < count; i++) {
        orders.push({
            orderNumber: `ORD-${Date.now()}-${i}`,
            total: Math.floor(Math.random() * 1000),
            items: generateOrderItems(Math.floor(Math.random() * 3) + 1)
        });
    }
    return orders;
}

function generateOrderItems(count: number) {
    const items = [];
    for (let i = 0; i < count; i++) {
        items.push({
            product: {
                name: `Product ${i}`,
                price: Math.floor(Math.random() * 100),
                category: {
                    name: `Category ${i % 5}`,
                    slug: `category-${i % 5}`
                }
            },
            quantity: Math.floor(Math.random() * 5) + 1
        });
    }
    return items;
}

// Mock user context
const mockUserContext = {
    userId: "user123",
    teamId: "team456", 
    roles: ["user"],
    isAdmin: false,
    permissions: ["read", "write"]
};

const mockAdminContext = {
    userId: "admin123",
    roles: ["admin"],
    isAdmin: true,
    permissions: ["read", "write", "delete", "admin"]
};
```

---

## 🔍 Test Execution Methods

### 1. **Manual Testing Script**

```typescript
// manual-test.ts
import { RBACPatternHandler } from './rbac-syntax-handler';

async function runManualTests() {
    const handler = new RBACPatternHandler(true);
    
    console.log('🧪 Starting RBAC Syntax Handler Manual Tests...\n');
    
    // Test 1: Basic Field Access
    console.log('Test 1: Basic Field Access');
    await testBasicFieldAccess(handler);
    
    // Test 2: Array Processing
    console.log('\nTest 2: Array Processing');
    await testArrayProcessing(handler);
    
    // Test 3: Wildcard Patterns
    console.log('\nTest 3: Wildcard Patterns');
    await testWildcardPatterns(handler);
    
    // Test 4: Context Resolution
    console.log('\nTest 4: Context Resolution');
    await testContextResolution(handler);
    
    // Test 5: Type Checking
    console.log('\nTest 5: Type Checking');
    await testTypeChecking(handler);
    
    // Test 6: Performance
    console.log('\nTest 6: Performance');
    await testPerformance(handler);
    
    console.log('\n✅ All manual tests completed!');
}

// Run the tests
runManualTests().catch(console.error);
```

### 2. **Automated Test Runner**

```bash
# Run all tests
npm test

# Run specific test categories
npm run test:unit
npm run test:integration  
npm run test:performance
npm run test:security

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch
```

### 3. **Continuous Integration Tests**

```yaml
# .github/workflows/rbac-tests.yml
name: RBAC Syntax Handler Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm run test:rbac
      - run: npm run test:performance
      - run: npm run test:security
```

---

## 📊 Expected Test Results

### Success Criteria
- ✅ **Pattern Validation**: 100% accurate syntax validation
- ✅ **Data Processing**: Correct field filtering for all patterns
- ✅ **Context Resolution**: Proper user context handling
- ✅ **Type Checking**: Accurate type validation
- ✅ **Performance**: < 1000ms for complex patterns on large datasets
- ✅ **Security**: No permission bypass vulnerabilities
- ✅ **Edge Cases**: Proper handling of null, undefined, empty data

### Performance Benchmarks
- Simple patterns (e.g., `name`): < 1ms
- Wildcard patterns (e.g., `profile.*`): < 10ms  
- Array patterns (e.g., `books.*.title`): < 50ms
- Complex nested (e.g., `users.*.orders.*.items.*`): < 200ms
- Large datasets (1000+ objects): < 1000ms

### Coverage Goals
- **Line Coverage**: > 95%
- **Branch Coverage**: > 90% 
- **Function Coverage**: 100%
- **Statement Coverage**: > 95%

---

## 🚨 Common Test Failures & Debugging

### Debug Mode Usage
```typescript
const handler = new RBACPatternHandler(true); // Enable debug
handler.enableDebug(true);

// Check pattern compilation
const complexity = handler.getPatternComplexity('profile.books.*.author.name');
console.log('Pattern complexity:', complexity);

// Check cache status
const cacheStats = handler.getCacheStats();
console.log('Cache stats:', cacheStats);
```

### Troubleshooting Common Issues
1. **Pattern not matching**: Check tokenization and compilation
2. **Context not resolving**: Verify user context structure
3. **Performance issues**: Check pattern complexity and data size
4. **Memory leaks**: Clear cache between tests
5. **Type errors**: Verify TypeScript strict mode compliance

---

*Phương pháp test này đảm bảo RBAC Syntax Handler hoạt động chính xác và an toàn trong mọi scenario thực tế.*