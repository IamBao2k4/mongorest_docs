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

// Updated test data with proper types
export const sampleUsers: Record<string, TestUser> = {
  // Basic users
  defaultUser: {
    sub: 'user_default_001',
    userId: 'user_default_001',
    username: 'default_user',
    roles: ['default'],
    isAdmin: false
  },
  
  // Level-based users (from original config)
  userLevel1: {
    sub: 'user_lv1_001',
    userId: 'user_lv1_001',
    username: 'user_level_1',
    roles: ['userlv_1'],
    isAdmin: false
  },

  userLevel2: {
    sub: 'user_lv2_001',
    userId: 'user_lv2_001',
    username: 'user_level_2',
    roles: ['userlv_2'],
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

  // Customer role
  customer: {
    sub: 'customer_001',
    userId: 'customer_001',
    username: 'customer_john',
    roles: ['customer'],
    isAdmin: false
  },

  // Content creators
  author: {
    sub: 'author_001',
    userId: 'author_001',
    username: 'author_jane',
    teamId: 'content_team',
    roles: ['author'],
    isAdmin: false
  },

  // Business users
  seller: {
    sub: 'seller_001',
    userId: 'seller_001',
    username: 'seller_alice',
    teamId: 'sales_team',
    roles: ['seller'],
    isAdmin: false
  },

  manager: {
    sub: 'manager_001',
    userId: 'manager_001',
    username: 'manager_bob',
    teamId: 'sales_team',
    roles: ['manager'],
    isAdmin: false
  },

  // Support and moderation
  support: {
    sub: 'support_001',
    userId: 'support_001',
    username: 'support_sarah',
    teamId: 'support_team',
    roles: ['support'],
    isAdmin: false
  },

  moderator: {
    sub: 'moderator_001',
    userId: 'moderator_001',
    username: 'moderator_tom',
    teamId: 'moderation_team',
    roles: ['moderator'],
    isAdmin: false
  },

  // Analytics users
  analyst: {
    sub: 'analyst_001',
    userId: 'analyst_001',
    username: 'analyst_lisa',
    teamId: 'analytics_team',
    roles: ['analyst'],
    isAdmin: false
  },

  // Admin
  admin: {
    sub: 'admin_001',
    userId: 'admin_001',
    username: 'admin_root',
    roles: ['admin'],
    isAdmin: true
  },

  // Multi-role users
  managerModerator: {
    sub: 'manager_mod_001',
    userId: 'manager_mod_001',
    username: 'manager_moderator',
    teamId: 'management_team',
    roles: ['manager', 'moderator'],
    isAdmin: false
  },

  // Edge case users - these are the problematic ones
  noRoleUser: {
    sub: 'no_role_001',
    userId: 'no_role_001',
    username: 'no_role_user'
    // No roles property - this is UserWithoutRoles type
  } as UserWithoutRoles,

  singleRoleUser: {
    sub: 'single_role_001',
    userId: 'single_role_001',
    username: 'single_role_user',
    role: 'user' // Single role, not array - this is UserWithSingleRole type
  } as UserWithSingleRole,

  emptyRolesUser: {
    sub: 'empty_roles_001',
    userId: 'empty_roles_001',
    username: 'empty_roles_user',
    roles: []
  } as UserWithEmptyRoles
};

// Helper function to safely get user roles
export function getUserRoles(user: TestUser): string[] {
  if ('roles' in user && Array.isArray(user.roles)) {
    return user.roles.length > 0 ? user.roles : ['default'];
  }
  if ('role' in user && typeof user.role === 'string') {
    return [user.role];
  }
  return ['default']; // Default fallback
}

// Helper function to safely get user info for testing
export function getUserInfo(user: TestUser) {
  return {
    userId: user.userId || user.sub,
    username: user.username,
    teamId: user.teamId,
    roles: getUserRoles(user),
    isAdmin: user.isAdmin || false
  };
}

// Expected results based on the new pattern-only configuration
export const expectedResults = {
  products: {
    read: {
      defaultUser: ['att1', 'att3', 'att5', 'att4'], // Simple patterns from default role
      userLevel1: ['att1', 'att3', 'att5', 'att4', 'att6'], // default + userlv_1 patterns
      userLevel2: ['att1', 'att3', 'att5', 'att4', 'att2'], // default + userlv_2 patterns
      customer: ['att1', 'att3', 'att4', 'att5', 'att8', 'name', 'price', 'description'], // customer role patterns
      seller: ['att1', 'att3', 'att5', 'att4', 'att2', 'att6', 'name', 'price', 'description', 'category', 'inventory'], // seller role patterns
      manager: ['att1', 'att2', 'att3', 'att4', 'att5', 'att6'], // manager role patterns
      admin: ['att1', 'att3', 'att5', 'att4'], // admin uses wildcard (**), no simple field patterns
      noRoleUser: ['att1', 'att3', 'att5', 'att4'], // defaults to 'default' role
      singleRoleUser: ['att1', 'att3', 'att5', 'att4'], // user role inherits default
      emptyRolesUser: ['att1', 'att3', 'att5', 'att4'] // defaults to 'default' role
    },
    write: {
      defaultUser: ['att1', 'att2'], // default role patterns
      userLevel1: ['att1', 'att2'], // inherits default
      userLevel2: ['att1', 'att2'], // inherits default
      customer: [], // customer has no simple field patterns for write
      seller: ['att1', 'att3', 'att4', 'att5', 'name', 'description', 'price', 'category', 'inventory'],
      manager: ['att1', 'att2', 'att3', 'att4', 'att6', 'name', 'description', 'price', 'category', 'status'],
      admin: [], // admin uses wildcard
      noRoleUser: ['att1', 'att2'],
      singleRoleUser: ['att1', 'att2'],
      emptyRolesUser: ['att1', 'att2']
    },
    delete: {
      defaultUser: [], // default has empty patterns for delete
      userLevel1: [], // inherits default
      userLevel2: [], // inherits default
      customer: [], // customer has no simple field patterns for delete
      seller: [], // seller has no simple field patterns for delete
      manager: ['att2', 'att3'], // manager role patterns
      admin: [], // admin uses wildcard
      noRoleUser: [],
      singleRoleUser: [],
      emptyRolesUser: []
    }
  },
  users: {
    read: {
      defaultUser: ['att1', 'att2', 'att3', 'id', 'username'], // default role simple patterns
      regularUser: ['att1', 'att2', 'att3', 'att8', 'id', 'username', 'email'], // user role
      moderator: ['att1', 'att2', 'att3', 'att8', 'att9', 'id', 'username', 'email', 'status', 'last_login'],
      manager: ['att1', 'att2', 'att3', 'att8', 'id', 'username', 'email', 'department', 'team'],
      admin: [], // admin uses wildcard
      noRoleUser: ['att1', 'att2', 'att3', 'id', 'username'],
      singleRoleUser: ['att1', 'att2', 'att3', 'att8', 'id', 'username', 'email'],
      emptyRolesUser: ['att1', 'att2', 'att3', 'id', 'username']
    },
    write: {
      defaultUser: ['att1', 'att2'], // default role
      regularUser: ['att1', 'att2', 'username', 'email'], // user role
      moderator: ['att1', 'att2', 'att8', 'username', 'email', 'status'],
      manager: ['att3', 'att4', 'username', 'email', 'department', 'team'],
      admin: [], // admin uses wildcard
      noRoleUser: ['att1', 'att2'],
      singleRoleUser: ['att1', 'att2', 'username', 'email'],
      emptyRolesUser: ['att1', 'att2']
    },
    delete: {
      defaultUser: [], // default has empty patterns
      regularUser: [], // user has no simple field patterns for delete
      moderator: [], // moderator has no simple field patterns for delete
      manager: [], // manager has no simple field patterns for delete
      admin: [], // admin uses wildcard
      noRoleUser: [],
      singleRoleUser: [],
      emptyRolesUser: []
    }
  },
  orders: {
    read: {
      defaultUser: [], // default has empty patterns for orders
      customer: ['att1', 'att2', 'att3', 'att4', 'att8', 'id', 'status', 'total', 'created_at'],
      seller: ['att1', 'att2', 'att3', 'att4', 'id', 'status', 'total', 'items'],
      support: ['att1', 'att2', 'att3', 'att4', 'att8', 'id', 'status', 'customer_id', 'total', 'items', 'support_notes', 'refund_status'],
      manager: ['att1', 'att2', 'att3', 'att4', 'att5'],
      admin: [], // admin uses wildcard
      noRoleUser: [],
      singleRoleUser: [],
      emptyRolesUser: []
    },
    write: {
      defaultUser: ['att1', 'att2'], // default role
      customer: ['att1', 'att2'], // customer inherits default
      seller: ['att8', 'status'],
      support: ['status', 'support_notes'],
      manager: ['att3', 'att5', 'att6', 'status', 'priority'],
      admin: [], // admin uses wildcard
      noRoleUser: ['att1', 'att2'],
      singleRoleUser: ['att1', 'att2'],
      emptyRolesUser: ['att1', 'att2']
    },
    delete: {
      defaultUser: [], // default has empty patterns
      customer: [], // customer has no simple field patterns for delete
      seller: [], // seller has no simple field patterns for delete
      support: [], // support has no simple field patterns for delete
      manager: ['att3'], // manager role
      admin: [], // admin uses wildcard
      noRoleUser: [],
      singleRoleUser: [],
      emptyRolesUser: []
    }
  },
  reports: {
    read: {
      defaultUser: ['att1', 'att2', 'att3', 'att4', 'att5'], // default role
      regularUser: ['att1', 'att2', 'att3', 'att4', 'att5'], // user inherits default
      analyst: ['att1', 'att2', 'att3', 'att4', 'att5', 'att6'], // analyst role
      manager: ['att1', 'att2', 'att3', 'att4', 'att5'], // manager inherits default
      admin: [], // admin uses wildcard
      noRoleUser: ['att1', 'att2', 'att3', 'att4', 'att5'],
      singleRoleUser: ['att1', 'att2', 'att3', 'att4', 'att5'],
      emptyRolesUser: ['att1', 'att2', 'att3', 'att4', 'att5']
    },
    write: {
      defaultUser: [], // default has empty patterns
      regularUser: [], // user has no simple field patterns for write
      analyst: [], // analyst has no simple field patterns for write
      manager: ['att1', 'att2', 'att3', 'att4'], // manager role
      admin: [], // admin uses wildcard
      noRoleUser: [],
      singleRoleUser: [],
      emptyRolesUser: []
    },
    delete: {
      defaultUser: [], // default has empty patterns
      regularUser: [], // user has no simple field patterns for delete
      analyst: [], // analyst has no simple field patterns for delete
      manager: ['att1', 'att2'], // manager role
      admin: [], // admin uses wildcard
      noRoleUser: [],
      singleRoleUser: [],
      emptyRolesUser: []
    }
  }
} as const;

export const sampleData = {
  // User data
  user: {
    id: 'user_001',
    username: 'john_doe',
    email: 'john@example.com',
    att1: 'Basic info 1',
    att2: 'Basic info 2',
    att3: 'Basic info 3',
    att8: 'Extended info',
    profile: {
      public: {
        name: 'John Doe',
        avatar: 'avatar.jpg',
        bio: 'Software developer'
      },
      user_001: {
        phone: '+1234567890',
        address: '123 Main St',
        preferences: { theme: 'dark' }
      },
      private: {
        ssn: '123-45-6789',
        sensitive: 'classified'
      }
    },
    settings: {
      user_001: {
        theme: 'dark',
        language: 'en',
        notifications: true,
        permissions: ['read', 'write']
      },
      team_001: {
        shared_settings: 'team_value'
      }
    }
  },

  // Product data
  product: {
    id: 'product_001',
    name: 'Laptop Pro',
    description: 'High-performance laptop',
    price: 1299.99,
    category: 'Electronics',
    inventory: 50,
    att1: 'Product Name',
    att2: 'Secret Internal Info',
    att3: 'Description',
    att4: 'Category',
    att5: 'Price',
    att6: 'Internal Code',
    att7: 'Admin Notes',
    att8: 'Extended Product Info',
    images: {
      public: ['image1.jpg', 'image2.jpg'],
      seller_001: ['private_image.jpg']
    },
    reviews: [
      { 
        id: 1, 
        rating: 5, 
        comment: 'Great product!',
        title: 'Excellent laptop'
      },
      { 
        id: 2, 
        rating: 4, 
        comment: 'Good value',
        title: 'Worth the money'
      }
    ],
    specifications: {
      basic: {
        weight: '2.5kg',
        dimensions: '30x20x2cm'
      },
      advanced: {
        processor: 'Intel i7',
        memory: '16GB'
      }
    },
    analytics: {
      seller_001: {
        views: 1000,
        conversion_rate: 0.05
      }
    },
    internal: {
      cost: 800,
      margin: 499.99
    }
  },

  // Order data  
  order: {
    id: 'order_001',
    status: 'processing',
    total: 1329.98,
    created_at: '2024-01-15T10:00:00Z',
    customer_id: 'customer_001',
    att1: 'Order ID',
    att2: 'Customer',
    att3: 'Items',
    att4: 'Status',
    att5: 'Internal Notes',
    att8: 'Order Details',
    orders: {
      customer_001: {
        id: 'order_001',
        shipping_address: '123 Customer St',
        notes: 'Please deliver carefully'
      }
    },
    items: [
      {
        seller_001: {
          product_id: 'product_001',
          quantity: 1,
          price: 1299.99,
          status: 'confirmed'
        }
      }
    ],
    shipping: {
      customer_001: {
        address: '123 Customer St',
        method: 'express'
      }
    },
    payment: {
      details: {
        card_number: '**** **** **** 1234'
      }
    }
  }
};