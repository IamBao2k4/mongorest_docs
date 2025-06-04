// config/relationships.ts
import { RelationshipRegistry } from "../relationship/RelationshipRegistry";

/**
 * Simple setup for basic relationships
 */
export function setupBasicRelationships(): RelationshipRegistry {
  const registry = new RelationshipRegistry();

  // Users -> Orders (1:many)
  registry.registerFromDefinition('users', {
    name: 'orders',
    targetTable: 'orders',
    localField: '_id',
    foreignField: 'customerId',
    type: 'one-to-many'
  });

  // Orders -> Customer (many:1)
  registry.registerFromDefinition('orders', {
    name: 'users',
    targetTable: 'users',
    localField: 'customerId',
    foreignField: '_id',
    type: 'many-to-one'
  });

  // Products -> Reviews (1:many)
  registry.registerFromDefinition('products', {
    name: 'reviews',
    targetTable: 'product_reviews',
    localField: '_id',
    foreignField: 'productId',
    type: 'one-to-many'
  });

  return registry;
}