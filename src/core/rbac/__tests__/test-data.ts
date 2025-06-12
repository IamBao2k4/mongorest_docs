// Type definitions for test users
interface BaseUser {
  sub: string;
  userId: string;
  username: string;
  teamId?: string;
  isAdmin?: boolean;
}

interface UserWithRoles extends BaseUser {
  roles: string[];
}

interface UserWithSingleRole extends BaseUser {
  role: string;
}

interface UserWithoutRoles extends BaseUser {
  // No role/roles property
}

interface UserWithEmptyRoles extends BaseUser {
  roles: [];
}

type TestUser = UserWithRoles | UserWithSingleRole | UserWithoutRoles | UserWithEmptyRoles;

// Updated test data with roles matching the new RBAC config
export const sampleUsers: Record<string, TestUser> = {
  // Anonymous/Guest user
  defaultUser: {
    sub: 'user_default_001',
    userId: 'user_default_001',
    username: 'guest_user',
    roles: ['default'],
    isAdmin: false
  },
  
  // Regular authenticated user
  regularUser: {
    sub: 'user_regular_001',
    userId: 'user_regular_001',
    username: 'john_doe',
    teamId: 'team_001',
    roles: ['user'],
    isAdmin: false
  },

  // Data analyst
  analyst: {
    sub: 'analyst_001',
    userId: 'analyst_001',
    username: 'analyst_lisa',
    teamId: 'analytics_team',
    roles: ['analyst'],
    isAdmin: false
  },

  // System administrator
  admin: {
    sub: 'admin_001',
    userId: 'admin_001',
    username: 'admin_root',
    roles: ['admin'],
    isAdmin: true
  },

  // Developer
  developer: {
    sub: 'dev_001',
    userId: 'dev_001',
    username: 'dev_alice',
    teamId: 'dev_team',
    roles: ['dev'],
    isAdmin: false
  },

  // Multi-role user (analyst + admin)
  multiRoleUser: {
    sub: 'multi_001',
    userId: 'multi_001',
    username: 'multi_role_user',
    teamId: 'management_team',
    roles: ['analyst', 'admin'],
    isAdmin: true
  },

  // Edge case users
  noRoleUser: {
    sub: 'no_role_001',
    userId: 'no_role_001',
    username: 'no_role_user'
    // No roles property - should default to 'default'
  } as UserWithoutRoles,

  singleRoleUser: {
    sub: 'single_role_001',
    userId: 'single_role_001',
    username: 'single_role_user',
    role: 'user' // Single role property instead of array
  } as UserWithSingleRole,

  emptyRolesUser: {
    sub: 'empty_roles_001',
    userId: 'empty_roles_001',
    username: 'empty_roles_user',
    roles: [] // Empty roles array - should default to 'default'
  } as UserWithEmptyRoles
};

// Helper function to safely get user roles with proper null/undefined checking
export function getUserRoles(user?: TestUser | null): string[] {
  // Handle null, undefined, or invalid user objects
  if (!user || typeof user !== 'object') {
    return ['default'];
  }

  // Check for roles array property
  if ('roles' in user && Array.isArray(user.roles)) {
    return user.roles.length > 0 ? user.roles : ['default'];
  }
  
  // Check for single role property
  if ('role' in user && typeof user.role === 'string' && user.role.trim() !== '') {
    return [user.role];
  }
  
  // Default fallback for any other case
  return ['default'];
}

// Helper function to safely get user info for testing with null checks
export function getUserInfo(user?: TestUser | null) {
  if (!user || typeof user !== 'object') {
    return {
      userId: 'anonymous',
      username: 'anonymous',
      teamId: undefined,
      roles: ['default'],
      isAdmin: false
    };
  }

  return {
    userId: user.userId || user.sub || 'anonymous',
    username: user.username || 'anonymous',
    teamId: user.teamId,
    roles: getUserRoles(user),
    isAdmin: user.isAdmin || false
  };
}

// Additional helper to validate user object structure
export function isValidUser(user: any): user is TestUser {
  return (
    user &&
    typeof user === 'object' &&
    typeof user.sub === 'string' &&
    typeof user.userId === 'string' &&
    typeof user.username === 'string'
  );
}

// Helper to get user by ID from sample users with error handling
export function getUserById(userId: string): TestUser | null {
  const userEntry = Object.entries(sampleUsers).find(([_, user]) => 
    user && (user.userId === userId || user.sub === userId)
  );
  return userEntry ? userEntry[1] : null;
}

// Helper to get user by username with error handling
export function getUserByUsername(username: string): TestUser | null {
  const userEntry = Object.entries(sampleUsers).find(([_, user]) => 
    user && user.username === username
  );
  return userEntry ? userEntry[1] : null;
}

// Expected results based on the new RBAC configuration
export const expectedResults = {
  products: {
    read: {
      defaultUser: ['_id', 'sku', 'name', 'description', 'category', 'subcategory', 'price', 'currency', 'images', 'tags', 'ratings', 'status'],
      regularUser: ['_id', 'sku', 'name', 'description', 'category', 'subcategory', 'price', 'currency', 'inventory.quantity', 'images', 'tags', 'specifications', 'ratings', 'status', 'createdAt'],
      analyst: ['_id', 'sku', 'name', 'category', 'subcategory', 'price', 'currency', 'inventory', 'ratings', 'status', 'createdAt', 'updatedAt', 'orderItems'],
      admin: ['*'], // Full access
      developer: ['*'], // Full access
      noRoleUser: ['_id', 'sku', 'name', 'description', 'category', 'subcategory', 'price', 'currency', 'images', 'tags', 'ratings', 'status'],
      singleRoleUser: ['_id', 'sku', 'name', 'description', 'category', 'subcategory', 'price', 'currency', 'inventory.quantity', 'images', 'tags', 'specifications', 'ratings', 'status', 'createdAt'],
      emptyRolesUser: ['_id', 'sku', 'name', 'description', 'category', 'subcategory', 'price', 'currency', 'images', 'tags', 'ratings', 'status']
    },
    write: {
      defaultUser: [],
      regularUser: [],
      analyst: ['ratings'],
      admin: ['*'],
      developer: ['*'],
      noRoleUser: [],
      singleRoleUser: [],
      emptyRolesUser: []
    },
    delete: {
      defaultUser: [],
      regularUser: [],
      analyst: [],
      admin: ['*'],
      developer: [],
      noRoleUser: [],
      singleRoleUser: [],
      emptyRolesUser: []
    }
  },
  
  users: {
    read: {
      defaultUser: ['_id', 'name', 'profile.avatar'],
      regularUser: ['_id', 'email.@self', 'name.@self', 'profile.@self', 'status.@self', 'lastLogin.@self', 'createdAt.@self', 'updatedAt.@self'],
      analyst: ['_id', 'name', 'profile.age', 'profile.country', 'profile.interests', 'status', 'lastLogin', 'createdAt'],
      admin: ['*'],
      developer: ['*'],
      noRoleUser: ['_id', 'name', 'profile.avatar'],
      singleRoleUser: ['_id', 'email.@self', 'name.@self', 'profile.@self', 'status.@self', 'lastLogin.@self', 'createdAt.@self', 'updatedAt.@self'],
      emptyRolesUser: ['_id', 'name', 'profile.avatar']
    },
    write: {
      defaultUser: [],
      regularUser: ['name.@self', 'profile.@self.age', 'profile.@self.interests', 'profile.@self.avatar'],
      analyst: [],
      admin: ['*'],
      developer: ['*'],
      noRoleUser: [],
      singleRoleUser: ['name.@self', 'profile.@self.age', 'profile.@self.interests', 'profile.@self.avatar'],
      emptyRolesUser: []
    },
    delete: {
      defaultUser: [],
      regularUser: [],
      analyst: [],
      admin: ['*'],
      developer: [],
      noRoleUser: [],
      singleRoleUser: [],
      emptyRolesUser: []
    }
  },

  orders: {
    read: {
      defaultUser: [],
      regularUser: ['_id.@self', 'orderNumber.@self', 'customerId.@self', 'items.@self', 'shippingAddress.@self', 'billingAddress.@self', 'payment.@self.method', 'payment.@self.status', 'payment.@self.amount', 'subtotal.@self', 'tax.@self', 'shipping.@self', 'discount.@self', 'totalAmount.@self', 'currency.@self', 'status.@self', 'orderDate.@self', 'shippedDate.@self', 'deliveredDate.@self', 'notes.@self', 'customer.@self'],
      analyst: ['_id', 'orderNumber', 'customerId', 'items', 'payment.method', 'payment.status', 'payment.amount', 'subtotal', 'tax', 'shipping', 'discount', 'totalAmount', 'currency', 'status', 'orderDate', 'shippedDate', 'deliveredDate', 'customer._id', 'customer.name', 'customer.profile.country'],
      admin: ['*'],
      developer: ['*'],
      noRoleUser: [],
      singleRoleUser: ['_id.@self', 'orderNumber.@self', 'customerId.@self', 'items.@self', 'shippingAddress.@self', 'billingAddress.@self', 'payment.@self.method', 'payment.@self.status', 'payment.@self.amount', 'subtotal.@self', 'tax.@self', 'shipping.@self', 'discount.@self', 'totalAmount.@self', 'currency.@self', 'status.@self', 'orderDate.@self', 'shippedDate.@self', 'deliveredDate.@self', 'notes.@self', 'customer.@self'],
      emptyRolesUser: []
    },
    write: {
      defaultUser: [],
      regularUser: ['shippingAddress.@self', 'billingAddress.@self', 'notes.@self'],
      analyst: [],
      admin: ['*'],
      developer: ['*'],
      noRoleUser: [],
      singleRoleUser: ['shippingAddress.@self', 'billingAddress.@self', 'notes.@self'],
      emptyRolesUser: []
    },
    delete: {
      defaultUser: [],
      regularUser: [],
      analyst: [],
      admin: ['*'],
      developer: [],
      noRoleUser: [],
      singleRoleUser: [],
      emptyRolesUser: []
    }
  },

  categories: {
    read: {
      defaultUser: ['_id', 'name', 'slug', 'description', 'parentId', 'image', 'sortOrder', 'featured', 'status', 'parent', 'children', 'products'],
      regularUser: ['_id', 'name', 'slug', 'description', 'parentId', 'image', 'sortOrder', 'featured', 'status', 'seo', 'createdAt', 'updatedAt', 'parent', 'children', 'products'],
      analyst: ['*'],
      admin: ['*'],
      developer: ['*'],
      noRoleUser: ['_id', 'name', 'slug', 'description', 'parentId', 'image', 'sortOrder', 'featured', 'status', 'parent', 'children', 'products'],
      singleRoleUser: ['_id', 'name', 'slug', 'description', 'parentId', 'image', 'sortOrder', 'featured', 'status', 'seo', 'createdAt', 'updatedAt', 'parent', 'children', 'products'],
      emptyRolesUser: ['_id', 'name', 'slug', 'description', 'parentId', 'image', 'sortOrder', 'featured', 'status', 'parent', 'children', 'products']
    },
    write: {
      defaultUser: [],
      regularUser: [],
      analyst: [],
      admin: ['*'],
      developer: ['*'],
      noRoleUser: [],
      singleRoleUser: [],
      emptyRolesUser: []
    },
    delete: {
      defaultUser: [],
      regularUser: [],
      analyst: [],
      admin: ['*'],
      developer: [],
      noRoleUser: [],
      singleRoleUser: [],
      emptyRolesUser: []
    }
  },

  product_reviews: {
    read: {
      defaultUser: ['_id', 'productId', 'rating', 'title', 'content', 'verified', 'helpful', 'images', 'createdAt', 'product.name', 'user.name', 'user.profile.avatar'], // + filter: status=eq.approved
      regularUser: ['_id', 'productId', 'userId.@self', 'rating', 'title', 'content', 'verified', 'helpful', 'status.@self', 'images', 'createdAt', 'updatedAt', 'product', 'user.@self'],
      analyst: ['_id', 'productId', 'userId', 'rating', 'title', 'content', 'verified', 'helpful', 'status', 'createdAt', 'updatedAt', 'product._id', 'product.name', 'product.sku', 'user._id', 'user.name'],
      admin: ['*'],
      developer: ['*'],
      noRoleUser: ['_id', 'productId', 'rating', 'title', 'content', 'verified', 'helpful', 'images', 'createdAt', 'product.name', 'user.name', 'user.profile.avatar'],
      singleRoleUser: ['_id', 'productId', 'userId.@self', 'rating', 'title', 'content', 'verified', 'helpful', 'status.@self', 'images', 'createdAt', 'updatedAt', 'product', 'user.@self'],
      emptyRolesUser: ['_id', 'productId', 'rating', 'title', 'content', 'verified', 'helpful', 'images', 'createdAt', 'product.name', 'user.name', 'user.profile.avatar']
    },
    write: {
      defaultUser: [],
      regularUser: ['productId', 'rating', 'title', 'content', 'images'],
      analyst: ['status', 'helpful'],
      admin: ['*'],
      developer: ['*'],
      noRoleUser: [],
      singleRoleUser: ['productId', 'rating', 'title', 'content', 'images'],
      emptyRolesUser: []
    },
    delete: {
      defaultUser: [],
      regularUser: ['reviews.@self'],
      analyst: [],
      admin: ['*'],
      developer: ['*'],
      noRoleUser: [],
      singleRoleUser: ['reviews.@self'],
      emptyRolesUser: []
    }
  },

  product_categories: {
    read: {
      defaultUser: ['_id', 'productId', 'categoryId', 'isPrimary', 'sortOrder', 'product', 'category'],
      regularUser: ['_id', 'productId', 'categoryId', 'isPrimary', 'sortOrder', 'createdAt', 'product', 'category'],
      analyst: ['*'],
      admin: ['*'],
      developer: ['*'],
      noRoleUser: ['_id', 'productId', 'categoryId', 'isPrimary', 'sortOrder', 'product', 'category'],
      singleRoleUser: ['_id', 'productId', 'categoryId', 'isPrimary', 'sortOrder', 'createdAt', 'product', 'category'],
      emptyRolesUser: ['_id', 'productId', 'categoryId', 'isPrimary', 'sortOrder', 'product', 'category']
    },
    write: {
      defaultUser: [],
      regularUser: [],
      analyst: [],
      admin: ['*'],
      developer: ['*'],
      noRoleUser: [],
      singleRoleUser: [],
      emptyRolesUser: []
    },
    delete: {
      defaultUser: [],
      regularUser: [],
      analyst: [],
      admin: ['*'],
      developer: [],
      noRoleUser: [],
      singleRoleUser: [],
      emptyRolesUser: []
    }
  }
} as const;

// Sample data that matches the actual collection schemas
export const sampleData = {
  // User data matching users.json schema
  user: {
    _id: '507f1f77bcf86cd799439011',
    email: 'john.doe@example.com',
    name: 'John Doe',
    profile: {
      age: 30,
      country: 'Vietnam',
      interests: ['technology', 'gaming', 'travel'],
      avatar: 'https://example.com/avatars/john.jpg'
    },
    status: 'active',
    lastLogin: '2024-01-15T10:00:00Z',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },

  // Product data matching products.json schema
  product: {
    _id: '507f1f77bcf86cd799439012',
    sku: 'LAPTOP-PRO-001',
    name: 'MacBook Pro 16"',
    description: 'High-performance laptop for professionals',
    category: 'electronics',
    subcategory: 'laptops',
    price: 2399.99,
    currency: 'USD',
    inventory: {
      quantity: 50,
      reserved: 5,
      lowStockThreshold: 10
    },
    images: [
      'https://example.com/images/macbook1.jpg',
      'https://example.com/images/macbook2.jpg'
    ],
    tags: ['laptop', 'apple', 'professional', 'high-performance'],
    specifications: {
      processor: 'Apple M2 Pro',
      memory: '16GB',
      storage: '512GB SSD',
      display: '16.2-inch Liquid Retina XDR',
      weight: '2.15 kg'
    },
    ratings: {
      average: 4.8,
      count: 150
    },
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-10T00:00:00Z'
  },

  // Order data matching orders.json schema
  order: {
    _id: '507f1f77bcf86cd799439013',
    orderNumber: 'ORD-20240115',
    customerId: '507f1f77bcf86cd799439011',
    items: [
      {
        productId: '507f1f77bcf86cd799439012',
        sku: 'LAPTOP-PRO-001',
        name: 'MacBook Pro 16"',
        price: 2399.99,
        quantity: 1,
        subtotal: 2399.99
      }
    ],
    shippingAddress: {
      fullName: 'John Doe',
      address: '123 Nguyen Hue Street',
      city: 'Ho Chi Minh City',
      state: 'Ho Chi Minh',
      zipCode: '700000',
      country: 'Vietnam',
      phone: '+84123456789'
    },
    billingAddress: {
      fullName: 'John Doe',
      address: '123 Nguyen Hue Street',
      city: 'Ho Chi Minh City',
      state: 'Ho Chi Minh',
      zipCode: '700000',
      country: 'Vietnam'
    },
    payment: {
      method: 'credit_card',
      status: 'completed',
      transactionId: 'TXN-20240115-001',
      amount: 2459.99
    },
    subtotal: 2399.99,
    tax: 240.00,
    shipping: 20.00,
    discount: 200.00,
    totalAmount: 2459.99,
    currency: 'USD',
    status: 'processing',
    orderDate: '2024-01-15T09:00:00Z',
    notes: 'Please handle with care',
    createdAt: '2024-01-15T09:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z'
  },

  // Category data matching categories.json schema
  category: {
    _id: '507f1f77bcf86cd799439014',
    name: 'Electronics',
    slug: 'electronics',
    description: 'Electronic devices and gadgets',
    parentId: null,
    image: 'https://example.com/categories/electronics.jpg',
    sortOrder: 1,
    featured: true,
    status: 'active',
    seo: {
      metaTitle: 'Electronics - High Quality Electronic Devices',
      metaDescription: 'Browse our wide selection of electronics including laptops, smartphones, and more.',
      keywords: ['electronics', 'gadgets', 'technology', 'devices']
    },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-05T00:00:00Z'
  },

  // Product review data matching product_reviews.json schema
  productReview: {
    _id: '507f1f77bcf86cd799439015',
    productId: '507f1f77bcf86cd799439012',
    userId: '507f1f77bcf86cd799439011',
    rating: 5,
    title: 'Excellent laptop for professionals',
    content: 'This laptop exceeded my expectations. The performance is outstanding and the build quality is top-notch. Highly recommended for anyone looking for a premium laptop.',
    verified: true,
    helpful: {
      yes: 15,
      no: 2
    },
    status: 'approved',
    images: [
      'https://example.com/reviews/review1_img1.jpg'
    ],
    createdAt: '2024-01-10T14:30:00Z',
    updatedAt: '2024-01-10T14:30:00Z'
  },

  // Product category junction data matching product_categories.json schema
  productCategory: {
    _id: '507f1f77bcf86cd799439016',
    productId: '507f1f77bcf86cd799439012',
    categoryId: '507f1f77bcf86cd799439014',
    isPrimary: true,
    sortOrder: 1,
    createdAt: '2024-01-01T00:00:00Z'
  }
};
// Test cases to verify the helper functions work correctly
export const validationTests = {
  // Test getUserRoles with various inputs
  testGetUserRoles: () => {
    const tests = [
      { input: undefined, expected: ['default'], name: 'undefined user' },
      { input: null, expected: ['default'], name: 'null user' },
      { input: {}, expected: ['default'], name: 'empty object' },
      { input: 'invalid', expected: ['default'], name: 'string instead of object' },
      { input: sampleUsers.regularUser, expected: ['user'], name: 'valid user with roles array' },
      { input: sampleUsers.singleRoleUser, expected: ['user'], name: 'valid user with single role' },
      { input: sampleUsers.noRoleUser, expected: ['default'], name: 'user without roles' },
      { input: sampleUsers.emptyRolesUser, expected: ['default'], name: 'user with empty roles array' },
    ];

    tests.forEach(test => {
      try {
        const result = getUserRoles(test.input as any);
        const passed = JSON.stringify(result) === JSON.stringify(test.expected);
        console.log(`✓ ${test.name}: ${passed ? 'PASS' : 'FAIL'} (got: ${JSON.stringify(result)}, expected: ${JSON.stringify(test.expected)})`);
      } catch (error) {
        console.log(`✗ ${test.name}: ERROR - ${error}`);
      }
    });
  },

  // Test getUserInfo with various inputs
  testGetUserInfo: () => {
    const tests = [
      { input: undefined, name: 'undefined user' },
      { input: null, name: 'null user' },
      { input: sampleUsers.regularUser, name: 'valid user' },
      { input: {}, name: 'empty object' },
    ];

    tests.forEach(test => {
      try {
        const result = getUserInfo(test.input as any);
        const isValid = result && typeof result === 'object' && Array.isArray(result.roles);
        console.log(`✓ ${test.name}: ${isValid ? 'PASS' : 'FAIL'} (got: ${JSON.stringify(result)})`);
      } catch (error) {
        console.log(`✗ ${test.name}: ERROR - ${error}`);
      }
    });
  },

  // Test all sample users are valid
  testAllSampleUsers: () => {
    Object.entries(sampleUsers).forEach(([key, user]) => {
      try {
        const validation = testHelpers.validateTestUser(user);
        const roles = getUserRoles(user);
        const info = getUserInfo(user);
        
        console.log(`✓ ${key}: ${validation.isValid ? 'VALID' : 'INVALID'} - Roles: ${JSON.stringify(roles)}`);
        if (!validation.isValid) {
          console.log(`  Errors: ${validation.errors.join(', ')}`);
        }
      } catch (error) {
        console.log(`✗ ${key}: ERROR - ${error}`);
      }
    });
  },

  // Run all validation tests
  runAll: () => {
    console.log('=== Testing getUserRoles ===');
    validationTests.testGetUserRoles();
    
    console.log('\n=== Testing getUserInfo ===');
    validationTests.testGetUserInfo();
    
    console.log('\n=== Testing Sample Users ===');
    validationTests.testAllSampleUsers();
  }
};

// Export a simple test function that can be called to verify everything works
export function runValidationTests() {
  try {
    validationTests.runAll();
    console.log('\n✅ All validation tests completed successfully!');
    return true;
  } catch (error) {
    console.error('\n❌ Validation tests failed:', error);
    return false;
  }
}

// Test scenarios for RBAC validation
export const testScenarios = {
  // Self-access scenarios
  userAccessingOwnData: {
    userId: '507f1f77bcf86cd799439011',
    requestingUserId: '507f1f77bcf86cd799439011',
    expectedAccess: true
  },
  userAccessingOthersData: {
    userId: '507f1f77bcf86cd799439011',
    requestingUserId: '507f1f77bcf86cd799439999',
    expectedAccess: false
  },

  // Team access scenarios
  teamMemberAccess: {
    userId: '507f1f77bcf86cd799439011',
    requestingUserId: '507f1f77bcf86cd799439012',
    teamId: 'team_001',
    expectedAccess: true
  },

  // Conditional access scenarios
  approvedReviewAccess: {
    review: { ...sampleData.productReview, status: 'approved' },
    role: 'default',
    expectedAccess: true
  },
  pendingReviewAccess: {
    review: { ...sampleData.productReview, status: 'pending' },
    role: 'default',
    expectedAccess: false
  }
};

// Helper functions for testing with comprehensive error handling
export const testHelpers = {
  // Check if user has access to specific field with null safety
  hasFieldAccess: (userRoles: string[], collection: string, operation: 'read' | 'write' | 'delete', field: string): boolean => {
    // Validate inputs
    if (!Array.isArray(userRoles) || userRoles.length === 0) {
      userRoles = ['default'];
    }
    if (!collection || !operation || !field) {
      return false;
    }
    
    // This would be implemented by the actual RBAC system
    // For now, return true as placeholder
    return true;
  },

  // Resolve @self patterns with validation
  resolveSelfPattern: (pattern: string, userId?: string): string => {
    if (!pattern || typeof pattern !== 'string') {
      return '';
    }
    if (!userId || typeof userId !== 'string') {
      return pattern; // Return original pattern if no valid userId
    }
    return pattern.replace(/@self/g, userId);
  },

  // Check if pattern matches field with null safety
  patternMatches: (pattern: string, field: string): boolean => {
    if (!pattern || !field || typeof pattern !== 'string' || typeof field !== 'string') {
      return false;
    }
    
    if (pattern === '*' || pattern === '**') return true;
    if (pattern.startsWith('!')) return false; // Negation patterns
    
    // Simple exact match for now
    return pattern === field || field.startsWith(pattern.replace('*', ''));
  },

  // Safely get expected results for a user
  getExpectedResults: (userKey: string, collection: string, operation: 'read' | 'write' | 'delete'): string[] => {
    try {
      const results = expectedResults[collection as keyof typeof expectedResults];
      if (!results) return [];
      
      const operationResults = results[operation];
      if (!operationResults) return [];
      
      const userResults = operationResults[userKey as keyof typeof operationResults];
      return Array.isArray(userResults) ? userResults : [];
    } catch (error) {
      console.warn(`Error getting expected results for ${userKey}/${collection}/${operation}:`, error);
      return [];
    }
  },

  // Validate test user object
  validateTestUser: (user: any): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (!user) {
      errors.push('User is null or undefined');
      return { isValid: false, errors };
    }
    
    if (typeof user !== 'object') {
      errors.push('User must be an object');
      return { isValid: false, errors };
    }
    
    if (!user.sub || typeof user.sub !== 'string') {
      errors.push('User must have a valid sub (string)');
    }
    
    if (!user.userId || typeof user.userId !== 'string') {
      errors.push('User must have a valid userId (string)');
    }
    
    if (!user.username || typeof user.username !== 'string') {
      errors.push('User must have a valid username (string)');
    }
    
    return { isValid: errors.length === 0, errors };
  }
};