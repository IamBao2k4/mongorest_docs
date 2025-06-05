export const sampleUsers = {
  // Basic default user
  defaultUser: {
    id: 1,
    username: 'john_doe',
    email: 'john@example.com',
    roles: ['default']
  },

  // User with level 1 permissions
  userLevel1: {
    id: 2,
    username: 'alice_smith',
    email: 'alice@example.com',
    roles: ['userlv_1'],
    department: 'sales'
  },

  // User with level 2 permissions
  userLevel2: {
    id: 3,
    username: 'bob_wilson',
    email: 'bob@example.com',
    roles: ['userlv_2'],
    department: 'marketing'
  },

  // Manager user
  manager: {
    id: 4,
    username: 'sarah_manager',
    email: 'sarah@example.com',
    roles: ['manager'],
    department: 'operations',
    level: 'senior'
  },

  // Admin user
  admin: {
    id: 5,
    username: 'admin_user',
    email: 'admin@example.com',
    roles: ['admin'],
    department: 'IT',
    permissions: ['full_access']
  },

  // User with multiple roles
  superUser: {
    id: 6,
    username: 'super_user',
    email: 'super@example.com',
    roles: ['manager'],
    department: 'executive'
  },

  // User with single role property (not array)
  singleRoleUser: {
    id: 7,
    username: 'single_role',
    email: 'single@example.com',
    role: ['userlv_1'] // Single role instead of array
  },

  // User with no roles (should default to 'default')
  noRoleUser: {
    id: 8,
    username: 'guest_user',
    email: 'guest@example.com'
    // No roles property
  }
};

// Expected results for each user and operation (based on actual RBAC config)
export const expectedResults = {
  products: {
    read: {
      defaultUser: ['att1', 'att3', 'att5', 'att4'], // default role
      userLevel1: ['att1', 'att3', 'att5', 'att4', 'att6'], // default + userlv_1
      userLevel2: ['att1', 'att3', 'att5', 'att4', 'att2'], // default + userlv_2
      manager: ['att1', 'att3', 'att5', 'att4', 'att2', 'att6'], // default + manager
      admin: ['att1', 'att3', 'att5', 'att4', 'att2', 'att6', 'att7'], // default + admin
      superUser: ['att1', 'att3', 'att5', 'att4', 'att2', 'att6'], // default + manager
      singleRoleUser: ['att1', 'att3', 'att5', 'att4', 'att6'], // default + userlv_1
      noRoleUser: ['att1', 'att3', 'att5', 'att4'] // default only
    },
    write: {
      defaultUser: ['att1', 'att2'], // default role
      userLevel1: ['att1', 'att2'], // default + userlv_1 (no userlv_1 write rule)
      userLevel2: ['att1', 'att2'], // default + userlv_2 (no userlv_2 write rule)
      manager: ['att1', 'att2'], // default + manager (no manager write rule)
      admin: ['att1', 'att2', 'att3', 'att4', 'att6'], // default + admin
      superUser: ['att1', 'att2'], // default + manager (no manager write rule)
      noRoleUser: ['att1', 'att2'] // default only
    },
    delete: {
      defaultUser: [], // default has "none"
      userLevel1: [], // default has "none", no userlv_1 delete rule
      userLevel2: [], // default has "none", no userlv_2 delete rule
      manager: ['att2', 'att3'], // default has "none" + manager
      admin: ['att1', 'att2', 'att5', 'att6'], // default has "none" + admin
      superUser: ['att2', 'att3'], // default has "none" + manager
      noRoleUser: [] // default has "none"
    }
  },
  orders: {
    read: {
      defaultUser: ['att1', 'att2', 'att3', 'att4'], // default role
      userLevel1: ['att1', 'att2', 'att3', 'att4'], // default + userlv_1 (no userlv_1 read rule)
      userLevel2: ['att1', 'att2', 'att3', 'att4'], // default + userlv_2 (no userlv_2 read rule)
      manager: ['att1', 'att2', 'att3', 'att4', 'att5'], // default + manager
      admin: ['att1', 'att2', 'att3', 'att4', 'att5', 'att7'], // default + admin
      superUser: ['att1', 'att2', 'att3', 'att4', 'att5'], // default + manager
      noRoleUser: ['att1', 'att2', 'att3', 'att4'] // default only
    },
    write: {
      defaultUser: ['att1', 'att2'], // default role
      userLevel1: ['att1', 'att2'], // default + userlv_1 (no userlv_1 write rule)
      userLevel2: ['att1', 'att2'], // default + userlv_2 (no userlv_2 write rule)
      manager: ['att1', 'att2', 'att3', 'att5', 'att6'], // default + manager
      admin: ['att1', 'att2', 'att3', 'att5', 'att6'], // default + admin
      superUser: ['att1', 'att2', 'att3', 'att5', 'att6'], // default + manager
      noRoleUser: ['att1', 'att2'] // default only
    },
    delete: {
      defaultUser: [], // default has "none"
      userLevel1: [], // default has "none", no userlv_1 delete rule
      userLevel2: [], // default has "none", no userlv_2 delete rule
      manager: [], // default has "none", manager has "none"
      admin: ['att3'], // default has "none" + admin
      superUser: [], // default has "none", manager has "none"
      noRoleUser: [] // default has "none"
    }
  },
  users: {
    read: {
      defaultUser: ['att1', 'att2', 'att3'], // default role
      userLevel1: ['att1', 'att2', 'att3'], // default + userlv_1 (no userlv_1 read rule)
      userLevel2: ['att1', 'att2', 'att3'], // default + userlv_2 (no userlv_2 read rule)
      manager: ['att1', 'att2', 'att3'], // default + manager (no manager read rule)
      admin: ['att1', 'att2', 'att3', 'att4', 'att5', 'att6', 'att7'], // default + admin
      superUser: ['att1', 'att2', 'att3'], // default + manager (no manager read rule)
      noRoleUser: ['att1', 'att2', 'att3'] // default only
    },
    write: {
      defaultUser: ['att1', 'att2'], // default role
      userLevel1: ['att1', 'att2'], // default + userlv_1 (no userlv_1 write rule)
      userLevel2: ['att1', 'att2'], // default + userlv_2 (no userlv_2 write rule)
      manager: ['att1', 'att2', 'att3', 'att4'], // default + manager
      admin: ['att1', 'att2', 'att3', 'att4'], // default + admin
      superUser: ['att1', 'att2', 'att3', 'att4'], // default + manager
      noRoleUser: ['att1', 'att2'] // default only
    },
    delete: {
      defaultUser: [], // default has "none"
      userLevel1: [], // default has "none", no userlv_1 delete rule
      userLevel2: [], // default has "none", no userlv_2 delete rule
      manager: [], // default has "none", manager has "none"
      admin: ['att7', 'att6'], // default has "none" + admin
      superUser: [], // default has "none", manager has "none"
      noRoleUser: [] // default has "none"
    }
  },
  reports: {
    read: {
      defaultUser: ['att1', 'att2', 'att3', 'att4', 'att5'], // default role
      userLevel1: ['att1', 'att2', 'att3', 'att4', 'att5'], // default + userlv_1 (no userlv_1 read rule)
      userLevel2: ['att1', 'att2', 'att3', 'att4', 'att5'], // default + userlv_2 (no userlv_2 read rule)
      manager: ['att1', 'att2', 'att3', 'att4', 'att5'], // default + manager (no manager read rule)
      admin: ['att1', 'att2', 'att3', 'att4', 'att5'], // default + admin (no admin read rule)
      superUser: ['att1', 'att2', 'att3', 'att4', 'att5'], // default + manager (no manager read rule)
      noRoleUser: ['att1', 'att2', 'att3', 'att4', 'att5'] // default only
    },
    write: {
      defaultUser: [], // default has "none"
      userLevel1: [], // default has "none", no userlv_1 write rule
      userLevel2: [], // default has "none", no userlv_2 write rule
      manager: ['att1', 'att2', 'att3', 'att4'], // default has "none" + manager
      admin: ['att1', 'att2', 'att3', 'att4'], // default has "none" + admin (no admin write rule for reports)
      superUser: ['att1', 'att2', 'att3', 'att4'], // default has "none" + manager
      noRoleUser: [] // default has "none"
    },
    delete: {
      defaultUser: [], // default has "none"
      userLevel1: [], // default has "none", no userlv_1 delete rule
      userLevel2: [], // default has "none", no userlv_2 delete rule
      manager: ['att1', 'att2'], // default has "none" + manager
      admin: ['att1', 'att2', 'att3', 'att4'], // default has "none" + admin
      superUser: ['att1', 'att2'], // default has "none" + manager
      noRoleUser: [] // default has "none"
    }
  }
};

// Test data for filtering and access control
export const sampleData = {
  product: {
    att1: 'Product Name',
    att2: 'Secret Internal Info',
    att3: 'Description',
    att4: 'Category',
    att5: 'Price',
    att6: 'Internal Code',
    att7: 'Admin Notes',
    att8: 'Should not appear'
  },
  order: {
    att1: 'Order ID',
    att2: 'Customer Info',
    att3: 'Items',
    att4: 'Status',
    att5: 'Internal Notes',
    att6: 'Payment Info',
    att7: 'Admin Comments'
  },
  user: {
    att1: 'Username',
    att2: 'Email',
    att3: 'Profile',
    att4: 'Permissions',
    att5: 'Internal ID',
    att6: 'Security Info',
    att7: 'Admin Data'
  }
};
