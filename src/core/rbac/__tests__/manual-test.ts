import jwt from 'jsonwebtoken';
import { 
  RBACValidator, 
  canAccessAttributes, 
  filterByRBAC, 
  getUserPermissions, 
  getAllowedAttributes 
} from '../rbac-validator';
import { sampleUsers } from './test-data';

// Generate JWT tokens for testing
const SECRET = 'your-secret-key'; // Use your own secret

console.log('='.repeat(60));
console.log('RBAC VALIDATOR MANUAL TEST');
console.log('='.repeat(60));

// Generate JWTs for sample users
const jwtTokens: Record<string, string> = {};

Object.entries(sampleUsers).forEach(([key, user]) => {
  // Don't set expiresIn since we want to avoid conflicts
  jwtTokens[key] = jwt.sign(user, SECRET);
  console.log(`\n${key} JWT:`);
  console.log(jwtTokens[key]);
  console.log(`User data:`, JSON.stringify(user, null, 2));
});

console.log('\n' + '='.repeat(60));
console.log('TEST RESULTS');
console.log('='.repeat(60));

// Test cases - Updated with more comprehensive scenarios
const testCases = [
  {
    collection: 'products',
    operation: 'read' as const,
    user: 'defaultUser',
    description: 'Default user reading products'
  },
  {
    collection: 'products',
    operation: 'read' as const,
    user: 'userLevel1',
    description: 'Level 1 user reading products (should have default + userlv_1)'
  },
  {
    collection: 'products',
    operation: 'read' as const,
    user: 'admin',
    description: 'Admin reading products (should have default + admin)'
  },
  {
    collection: 'products',
    operation: 'write' as const,
    user: 'admin',
    description: 'Admin writing to products'
  },
  {
    collection: 'products',
    operation: 'delete' as const,
    user: 'defaultUser',
    description: 'Default user deleting from products (should be empty)'
  },
  {
    collection: 'products',
    operation: 'delete' as const,
    user: 'manager',
    description: 'Manager deleting from products'
  },
  {
    collection: 'orders',
    operation: 'read' as const,
    user: 'manager',
    description: 'Manager reading orders'
  },
  {
    collection: 'orders',
    operation: 'write' as const,
    user: 'admin',
    description: 'Admin writing to orders'
  },
  {
    collection: 'users',
    operation: 'read' as const,
    user: 'admin',
    description: 'Admin reading users'
  },
  {
    collection: 'users',
    operation: 'delete' as const,
    user: 'admin',
    description: 'Admin deleting from users'
  },
  {
    collection: 'reports',
    operation: 'write' as const,
    user: 'manager',
    description: 'Manager writing to reports'
  },
  {
    collection: 'reports',
    operation: 'delete' as const,
    user: 'admin',
    description: 'Admin deleting from reports'
  }
];

testCases.forEach((testCase, index) => {
  console.log(`\nTest ${index + 1}: ${testCase.description}`);
  console.log('-'.repeat(40));
  
  const result = RBACValidator(
    testCase.collection, 
    testCase.operation, 
    jwtTokens[testCase.user]
  );
  
  console.log(`Collection: ${testCase.collection}`);
  console.log(`Operation: ${testCase.operation}`);
  console.log(`User: ${testCase.user}`);
  console.log(`Allowed attributes:`, result);
});

// Test getAllowedAttributes function directly
console.log('\n' + '='.repeat(60));
console.log('GET ALLOWED ATTRIBUTES DIRECT TEST');
console.log('='.repeat(60));

const directTestCases = [
  { collection: 'products', operation: 'read' as const, roles: ['default'], desc: 'Default role only' },
  { collection: 'products', operation: 'read' as const, roles: ['userlv_1'], desc: 'UserLv1 role only' },
  { collection: 'products', operation: 'read' as const, roles: ['admin'], desc: 'Admin role only' },
  { collection: 'products', operation: 'read' as const, roles: ['admin', 'manager'], desc: 'Multiple roles' },
  { collection: 'products', operation: 'read' as const, roles: [], desc: 'No roles (should default)' },
];

directTestCases.forEach((testCase, index) => {
  console.log(`\nDirect Test ${index + 1}: ${testCase.desc}`);
  console.log('-'.repeat(40));
  
  const result = getAllowedAttributes(testCase.collection, testCase.operation, testCase.roles);
  console.log(`Collection: ${testCase.collection}`);
  console.log(`Operation: ${testCase.operation}`);
  console.log(`Roles: [${testCase.roles.join(', ')}]`);
  console.log(`Allowed attributes:`, result);
});

// Test canAccessAttributes with various scenarios
console.log('\n' + '='.repeat(60));
console.log('COMPREHENSIVE ATTRIBUTE ACCESS TEST');
console.log('='.repeat(60));

const accessTestCases = [
  {
    collection: 'products',
    operation: 'read' as const,
    user: 'defaultUser',
    requested: ['att1', 'att2', 'att3', 'att6', 'att7'],
    desc: 'Default user requesting mixed attributes'
  },
  {
    collection: 'products',
    operation: 'read' as const,
    user: 'admin',
    requested: ['att1', 'att2', 'att3', 'att6', 'att7'],
    desc: 'Admin requesting same attributes'
  },
  {
    collection: 'orders',
    operation: 'write' as const,
    user: 'manager',
    requested: ['att1', 'att2', 'att3', 'att5', 'att6', 'att7'],
    desc: 'Manager writing to orders'
  }
];

accessTestCases.forEach((testCase, index) => {
  console.log(`\nAccess Test ${index + 1}: ${testCase.desc}`);
  console.log('-'.repeat(40));
  
  const result = canAccessAttributes(
    testCase.collection,
    testCase.operation,
    jwtTokens[testCase.user],
    testCase.requested
  );
  
  console.log(`Requested: [${testCase.requested.join(', ')}]`);
  console.log(`Allowed: [${result.allowed.join(', ')}]`);
  console.log(`Denied: [${result.denied.join(', ')}]`);
});

// Test filterByRBAC with different data structures
console.log('\n' + '='.repeat(60));
console.log('COMPREHENSIVE DATA FILTERING TEST');
console.log('='.repeat(60));

const filterTestData = [
  {
    name: 'Product Data',
    data: {
      att1: 'Product Name',
      att2: 'Secret Info',
      att3: 'Description',
      att4: 'Category',
      att5: 'Price',
      att6: 'Internal Code',
      att7: 'Admin Notes',
      att8: 'Should not appear'
    }
  },
  {
    name: 'Order Data',
    data: {
      att1: 'Order ID',
      att2: 'Customer',
      att3: 'Items',
      att4: 'Status',
      att5: 'Internal Notes',
      att6: 'Payment',
      att7: 'Admin Comments'
    }
  }
];

const filterUsers = ['defaultUser', 'userLevel1', 'manager', 'admin'];

filterTestData.forEach(testData => {
  console.log(`\n${testData.name} Filtering:`);
  console.log('Original:', JSON.stringify(testData.data, null, 2));
  
  filterUsers.forEach(user => {
    const filtered = filterByRBAC('products', 'read', jwtTokens[user], testData.data);
    console.log(`\n${user} filtered:`, JSON.stringify(filtered, null, 2));
  });
});

// Test getUserPermissions comprehensive overview
console.log('\n' + '='.repeat(60));
console.log('COMPREHENSIVE USER PERMISSIONS OVERVIEW');
console.log('='.repeat(60));

const permissionUsers = ['defaultUser', 'userLevel1', 'manager', 'admin'];

permissionUsers.forEach(user => {
  console.log(`\n${user.toUpperCase()} PERMISSIONS:`);
  console.log('='.repeat(40));
  const permissions = getUserPermissions(jwtTokens[user]);
  
  Object.entries(permissions).forEach(([collection, ops]) => {
    console.log(`\n${collection}:`);
    Object.entries(ops).forEach(([operation, attributes]) => {
      console.log(`  ${operation}: [${(attributes as string[]).join(', ')}]`);
    });
  });
});

// Test edge cases
console.log('\n' + '='.repeat(60));
console.log('EDGE CASE TESTS');
console.log('='.repeat(60));

// Invalid JWT
console.log('\nInvalid JWT test:');
const invalidResult = RBACValidator('products', 'read', 'invalid.jwt.token');
console.log('Result:', invalidResult);

// Non-existent collection
console.log('\nNon-existent collection test:');
const nonExistentResult = RBACValidator('nonexistent', 'read', jwtTokens.defaultUser);
console.log('Result:', nonExistentResult);

// Empty parameters
console.log('\nEmpty parameters test:');
console.log('Empty collection:', RBACValidator('', 'read', jwtTokens.defaultUser));
console.log('Empty JWT:', RBACValidator('products', 'read', ''));

// No role user
console.log('\nNo role user test:');
const noRoleResult = RBACValidator('products', 'read', jwtTokens.noRoleUser);
console.log('Result:', noRoleResult);

console.log('\n' + '='.repeat(60));
console.log('MANUAL TEST COMPLETED SUCCESSFULLY');
console.log('='.repeat(60));
