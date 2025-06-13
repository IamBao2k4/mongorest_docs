// config/relationships.ts
import { RelationshipRegistry } from "../relationship/RelationshipRegistry";
import { RelationshipDefinition } from "../relationship/types";

/**
 * Complete relationship setup for e-commerce system
 * Covers all relationships between Users, Categories, Products, Orders, Reviews, and Product_Categories
 */
export function setupEcommerceRelationships(): RelationshipRegistry {
  const registry = new RelationshipRegistry();

  // ===== USER RELATIONSHIPS =====
  
  // Users -> Orders (1:many)
  registry.registerFromDefinition('look_users', {
    name: 'look_orders',
    targetTable: 'orders',
    localField: '_id',
    foreignField: 'customerId',
    type: 'one-to-many'
  });

  // Users -> Reviews (1:many)
  registry.registerFromDefinition('look_users', {
    name: 'look_product_reviews',
    targetTable: 'product_reviews',
    localField: '_id',
    foreignField: 'userId',
    type: 'one-to-many'
  });

  // ===== CATEGORY RELATIONSHIPS =====
  
  // Categories -> Parent Category (many:1) - Self-referencing
  registry.registerFromDefinition('look_categories', {
    name: 'parent',
    targetTable: 'categories',
    localField: 'parentId',
    foreignField: '_id',
    type: 'many-to-one'
  });

  // Categories -> Child Categories (1:many) - Self-referencing
  registry.registerFromDefinition('look_categories', {
    name: 'children',
    targetTable: 'categories',
    localField: '_id',
    foreignField: 'parentId',
    type: 'one-to-many'
  });

  // Categories -> Products (many:many) via junction table
  registry.registerFromDefinition('look_categories', {
    name: 'look_products',
    targetTable: 'products',
    localField: '_id',
    foreignField: '_id',
    type: 'many-to-many',
    junction: {
      table: 'product_categories',
      localKey: 'categoryId',
      foreignKey: 'productId'
    }
  });

  // Categories -> Primary Products (1:many) - Direct relationship
  registry.registerFromDefinition('look_categories', {
    name: 'look_products',
    targetTable: 'products',
    localField: '_id',
    foreignField: 'primaryCategoryId',
    type: 'one-to-many'
  });

  // ===== PRODUCT RELATIONSHIPS =====
  
  // Products -> Primary Category (many:1)
  registry.registerFromDefinition('look_products', {
    name: 'look_category',
    targetTable: 'categories',
    localField: 'primaryCategoryId',
    foreignField: '_id',
    type: 'many-to-one'
  });

  // Products -> Categories (many:many) via junction table
  registry.registerFromDefinition('look_products', {
    name: 'look_categories',
    targetTable: 'categories',
    localField: '_id',
    foreignField: '_id',
    type: 'many-to-many',
    junction: {
      table: 'product_categories',
      localKey: 'productId',
      foreignKey: 'categoryId'
    }
  });

  // Products -> Reviews (1:many)
  registry.registerFromDefinition('look_products', {
    name: 'look_product_reviews',
    targetTable: 'product_reviews',
    localField: '_id',
    foreignField: 'productId',
    type: 'one-to-many'
  });

  // ===== ORDER RELATIONSHIPS =====
  
  // Orders -> Customer/User (many:1)
  registry.registerFromDefinition('look_orders', {
    name: 'look_users',
    targetTable: 'users',
    localField: 'customerId',
    foreignField: '_id',
    type: 'many-to-one'
  });

  // ===== REVIEW RELATIONSHIPS =====
  
  // Reviews -> Product (many:1)
  registry.registerFromDefinition('look_product_reviews', {
    name: 'look_products',
    targetTable: 'products',
    localField: 'productId',
    foreignField: '_id',
    type: 'many-to-one'
  });

  // Reviews -> User (many:1)
  registry.registerFromDefinition('look_product_reviews', {
    name: 'look_users',
    targetTable: 'users',
    localField: 'userId',
    foreignField: '_id',
    type: 'many-to-one'
  });

  // ===== JUNCTION TABLE RELATIONSHIPS =====
  
  // Product_Categories -> Product (many:1)
  registry.registerFromDefinition('look_categories', {
    name: 'look_products',
    targetTable: 'products',
    localField: 'productId',
    foreignField: '_id',
    type: 'many-to-one'
  });

  // Product_Categories -> Category (many:1)
  registry.registerFromDefinition('look_categories', {
    name: 'look_categories',
    targetTable: 'categories',
    localField: 'categoryId',
    foreignField: '_id',
    type: 'many-to-one'
  });

  return registry;
}

/**
 * Simple setup for basic relationships (minimal version)
 */
export function setupBasicRelationships(): RelationshipRegistry {
  const registry = new RelationshipRegistry();
  
  // Users -> Orders (1:many)
  registry.registerFromDefinition('users', {
    name: 'look_orders',
    targetTable: 'orders',
    localField: '_id',
    foreignField: 'customerId',
    type: 'one-to-many'
  });

  // Orders -> Customer (many:1)
  registry.registerFromDefinition('orders', {
    name: 'look_users',
    targetTable: 'users',
    localField: 'customerId',
    foreignField: '_id',
    type: 'many-to-one'
  });

  // Products -> Reviews (1:many)
  registry.registerFromDefinition('products', {
    name: 'look_product_reviews',
    targetTable: 'product_reviews',
    localField: '_id',
    foreignField: 'productId',
    type: 'one-to-many'
  });

  // Categories -> Products (many:many)
  registry.registerFromDefinition('categories', {
    name: 'look_products',
    targetTable: 'products',
    localField: '_id',
    foreignField: '_id',
    type: 'many-to-many',
    junction: {
      table: 'product_categories',
      localKey: 'categoryId',
      foreignKey: 'productId'
    }
  });

  return registry;
}

/**
 * Bulk configuration approach using the registerBulk method
 */
export function setupRelationshipsFromConfig(): RelationshipRegistry {
  const registry = new RelationshipRegistry();
  
  const config: Record<string, RelationshipDefinition[]> = {
    // User relationships
    users: [
      {
        name: 'orders',
        targetTable: 'orders',
        localField: '_id',
        foreignField: 'customerId',
        type: 'one-to-many'
      },
      {
        name: 'product_reviews',
        targetTable: 'product_reviews',
        localField: '_id',
        foreignField: 'userId',
        type: 'one-to-many'
      }
    ],
    
    // Category relationships
    categories: [
      {
        name: 'parent',
        targetTable: 'categories',
        localField: 'parentId',
        foreignField: '_id',
        type: 'many-to-one'
      },
      {
        name: 'children',
        targetTable: 'categories',
        localField: '_id',
        foreignField: 'parentId',
        type: 'one-to-many'
      },
      {
        name: 'products',
        targetTable: 'products',
        localField: '_id',
        foreignField: '_id',
        type: 'many-to-many',
        junction: {
          table: 'product_categories',
          localKey: 'categoryId',
          foreignKey: 'productId'
        }
      },
      {
        name: 'primaryProducts',
        targetTable: 'products',
        localField: '_id',
        foreignField: 'primaryCategoryId',
        type: 'one-to-many'
      }
    ],
    
    // Product relationships
    products: [
      {
        name: 'primaryCategory',
        targetTable: 'categories',
        localField: 'primaryCategoryId',
        foreignField: '_id',
        type: 'many-to-one'
      },
      {
        name: 'categories',
        targetTable: 'categories',
        localField: '_id',
        foreignField: '_id',
        type: 'many-to-many',
        junction: {
          table: 'product_categories',
          localKey: 'productId',
          foreignKey: 'categoryId'
        }
      },
      {
        name: 'product_reviews',
        targetTable: 'product_reviews',
        localField: '_id',
        foreignField: 'productId',
        type: 'one-to-many'
      }
    ],
    
    // Order relationships
    orders: [
      {
        name: 'customer',
        targetTable: 'users',
        localField: 'customerId',
        foreignField: '_id',
        type: 'many-to-one'
      }
    ],
    
    // Review relationships
    product_reviews: [
      {
        name: 'product',
        targetTable: 'products',
        localField: 'productId',
        foreignField: '_id',
        type: 'many-to-one'
      },
      {
        name: 'user',
        targetTable: 'users',
        localField: 'userId',
        foreignField: '_id',
        type: 'many-to-one'
      }
    ],
    
    // Junction table relationships
    product_categories: [
      {
        name: 'product',
        targetTable: 'products',
        localField: 'productId',
        foreignField: '_id',
        type: 'many-to-one'
      },
      {
        name: 'category',
        targetTable: 'categories',
        localField: 'categoryId',
        foreignField: '_id',
        type: 'many-to-one'
      }
    ]
  };
  
  // Use the bulk registration method
  registry.registerBulk(config);
  
  return registry;
}

/**
 * Helper function to validate relationships exist in registry
 */
export function validateRelationships(registry: RelationshipRegistry): boolean {
  const expectedRelationships = [
    ['users', 'orders'],
    ['users', 'product_reviews'],
    ['categories', 'parent'],
    ['categories', 'children'],
    ['categories', 'products'],
    ['categories', 'primaryProducts'],
    ['products', 'primaryCategory'],
    ['products', 'categories'],
    ['products', 'product_reviews'],
    ['orders', 'customer'],
    ['product_reviews', 'product'],
    ['product_reviews', 'user'],
    ['product_categories', 'product'],
    ['product_categories', 'category']
  ];
  
  const allRelationships = registry.getAll();
  console.log(`📊 Total registered relationships: ${allRelationships.size}`);
  
  for (const [table, relationshipName] of expectedRelationships) {
    if (!registry.has(table, relationshipName)) {
      console.error(`❌ Missing relationship: ${table}.${relationshipName}`);
      return false;
    }
  }
  
  console.log('✅ All relationships validated successfully');
  
  // Print summary by table
  console.log('\n📋 Relationships by table:');
  const tables = ['users', 'categories', 'products', 'orders', 'product_reviews', 'product_categories'];
  for (const table of tables) {
    const tableRelationships = registry.getForTable(table);
    console.log(`  ${table}: ${tableRelationships.length} relationships`);
    tableRelationships.forEach(rel => {
      console.log(`    - ${rel.name} (${rel.type})`);
    });
  }
  
  return true;
}

/**
 * Utility function to get relationship statistics
 */
export function getRelationshipStats(registry: RelationshipRegistry): {
  totalRelationships: number;
  byType: Record<string, number>;
  byTable: Record<string, number>;
} {
  const allRelationships = registry.getAll();
  const stats = {
    totalRelationships: allRelationships.size,
    byType: {} as Record<string, number>,
    byTable: {} as Record<string, number>
  };
  
  for (const [key, relationship] of allRelationships) {
    const table = key.split('.')[0];
    
    // Count by type
    stats.byType[relationship.type] = (stats.byType[relationship.type] || 0) + 1;
    
    // Count by table
    stats.byTable[table] = (stats.byTable[table] || 0) + 1;
  }
  
  return stats;
}

// Export default as the complete setup
export default setupEcommerceRelationships;