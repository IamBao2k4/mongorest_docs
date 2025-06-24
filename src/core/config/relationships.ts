// config/relationships.ts
import { RelationshipRegistry } from "../adapters/base/relationship/RelationshipRegistry";
import { RelationshipDefinition } from "../adapters/base/relationship/types";

/**
 * Complete relationship setup for e-commerce system
 * Covers all relationships between Users, Categories, Products, Orders, Reviews, and Product_Categories
 */
export function setupEcommerceRelationships(): RelationshipRegistry {
  const registry = new RelationshipRegistry();

  // ===== USER RELATIONSHIPS =====
  
  // Users -> Orders (1:many)
  registry.registerFromDefinition('users', {
    name: 'orders',
    targetTable: 'orders',
    localField: '_id',
    foreignField: 'customerId',
    type: 'one-to-many'
  });

  // Users -> Reviews (1:many)
  registry.registerFromDefinition('users', {
    name: 'product_reviews',
    targetTable: 'product_reviews',
    localField: '_id',
    foreignField: 'userId',
    type: 'one-to-many'
  });

  // ===== CATEGORY RELATIONSHIPS =====
  
  // Categories -> Parent Category (many:1) - Self-referencing
  registry.registerFromDefinition('categories', {
    name: 'parent',
    targetTable: 'categories',
    localField: 'parentId',
    foreignField: '_id',
    type: 'many-to-one'
  });

  // Categories -> Child Categories (1:many) - Self-referencing
  registry.registerFromDefinition('categories', {
    name: 'children',
    targetTable: 'categories',
    localField: '_id',
    foreignField: 'parentId',
    type: 'one-to-many'
  });

  // Categories -> Products (many:many) via junction table
  registry.registerFromDefinition('categories', {
    name: 'products_many_to_many',
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
  registry.registerFromDefinition('categories', {
    name: 'primary_products',
    targetTable: 'products',
    localField: '_id',
    foreignField: 'primaryCategoryId',
    type: 'one-to-many'
  });

  // ===== PRODUCT RELATIONSHIPS =====
  
  // Products -> Primary Category (many:1)
  registry.registerFromDefinition('products', {
    name: 'category',
    targetTable: 'categories',
    localField: 'primaryCategoryId',
    foreignField: '_id',
    type: 'many-to-one'
  });

  // Products -> Categories (many:many) via junction table
  registry.registerFromDefinition('products', {
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
  });

  // Products -> Reviews (1:many)
  registry.registerFromDefinition('products', {
    name: 'product_reviews',
    targetTable: 'product_reviews',
    localField: '_id',
    foreignField: 'productId',
    type: 'one-to-many'
  });

  // ===== ORDER RELATIONSHIPS =====
  
  // Orders -> Customer/User (many:1)
  registry.registerFromDefinition('orders', {
    name: 'users',
    targetTable: 'users',
    localField: 'customerId',
    foreignField: '_id',
    type: 'many-to-one'
  });

  // ===== REVIEW RELATIONSHIPS =====
  
  // Reviews -> Product (many:1)
  registry.registerFromDefinition('product_reviews', {
    name: 'products',
    targetTable: 'products',
    localField: 'productId',
    foreignField: '_id',
    type: 'many-to-one'
  });

  // Reviews -> User (many:1)
  registry.registerFromDefinition('product_reviews', {
    name: 'users',
    targetTable: 'users',
    localField: 'userId',
    foreignField: '_id',
    type: 'many-to-one'
  });

  // ===== JUNCTION TABLE RELATIONSHIPS =====
  
  // Product_Categories -> Product (many:1)
  registry.registerFromDefinition('product_categories', {
    name: 'product',
    targetTable: 'products',
    localField: 'productId',
    foreignField: '_id',
    type: 'many-to-one'
  });

  // Product_Categories -> Category (many:1)
  registry.registerFromDefinition('product_categories', {
    name: 'category',
    targetTable: 'categories',
    localField: 'categoryId',
    foreignField: '_id',
    type: 'many-to-one'
  });

  return registry;
}

// Export default as the complete setup
export default setupEcommerceRelationships;
