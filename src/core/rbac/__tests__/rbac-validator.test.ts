import jwt from 'jsonwebtoken';
import { 
  RBACValidator, 
  getAllowedAttributes, 
  canAccessAttributes, 
  filterByRBAC, 
  getUserPermissions 
} from '../rbac-validator';
import { sampleUsers, expectedResults, sampleData } from './test-data';

// Helper function to create JWT tokens for testing
function createTestJWT(user: any, secret: string = 'test-secret'): string {
  return jwt.sign(user, secret);
}

describe('RBAC Validator Complete Test Suite', () => {
  let testJWTs: Record<string, string>;

  beforeAll(() => {
    // Generate JWTs for all test users
    testJWTs = {};
    Object.entries(sampleUsers).forEach(([key, user]) => {
      testJWTs[key] = createTestJWT(user);
    });
  });

  describe('getAllowedAttributes Function', () => {
    test('should return correct attributes for default role', () => {
      const result = getAllowedAttributes('products', 'read', ['default']);
      expect(result.sort()).toEqual(['att1', 'att3', 'att5', 'att4'].sort());
    });

    test('should return correct attributes for single non-default role', () => {
      const result = getAllowedAttributes('products', 'read', ['admin']);
      expect(result.sort()).toEqual(['att1', 'att3', 'att5', 'att4', 'att2', 'att6', 'att7'].sort());
    });

    test('should return correct attributes for multiple roles', () => {
      const result = getAllowedAttributes('products', 'read', ['manager', 'admin']);
      expect(result.sort()).toEqual(['att1', 'att3', 'att5', 'att4', 'att2', 'att6', 'att7'].sort());
    });

    test('should default to default role when no roles provided', () => {
      const result = getAllowedAttributes('products', 'read', []);
      expect(result.sort()).toEqual(['att1', 'att3', 'att5', 'att4'].sort());
    });

    test('should return empty array for non-existent collection', () => {
      const result = getAllowedAttributes('nonexistent', 'read', ['default']);
      expect(result).toEqual([]);
    });

    test('should handle "none" attributes correctly', () => {
      const result = getAllowedAttributes('products', 'delete', ['default']);
      expect(result).toEqual([]);
    });
  });

  describe('RBACValidator Function', () => {
    Object.entries(expectedResults).forEach(([collection, operations]) => {
      Object.entries(operations).forEach(([operation, userResults]) => {
        Object.entries(userResults).forEach(([user, expected]) => {
          test(`${user} ${operation} ${collection}`, () => {
            const result = RBACValidator(collection, operation as any, testJWTs[user]);
            expect(result.sort()).toEqual((expected as string[]).sort());
          });
        });
      });
    });

    test('should handle invalid JWT', () => {
      const result = RBACValidator('products', 'read', 'invalid.jwt.token');
      expect(result).toEqual([]);
    });

    test('should handle empty parameters', () => {
      expect(RBACValidator('', 'read', testJWTs.defaultUser)).toEqual([]);
      expect(RBACValidator('products', 'read', '')).toEqual([]);
    });

    test('should handle malformed JWT', () => {
      const result = RBACValidator('products', 'read', 'not.a.jwt');
      expect(result).toEqual([]);
    });
  });

  describe('canAccessAttributes Function', () => {
    test('should correctly identify allowed and denied attributes', () => {
      const requestedAttributes = ['att1', 'att2', 'att3', 'att6', 'att7'];
      const result = canAccessAttributes('products', 'read', testJWTs.defaultUser, requestedAttributes);
      
      expect(result.allowed.sort()).toEqual(['att1', 'att3'].sort());
      expect(result.denied.sort()).toEqual(['att2', 'att6', 'att7'].sort());
    });

    test('should handle admin permissions correctly', () => {
      const requestedAttributes = ['att1', 'att2', 'att3', 'att6', 'att7'];
      const result = canAccessAttributes('products', 'read', testJWTs.admin, requestedAttributes);
      
      expect(result.allowed.sort()).toEqual(requestedAttributes.sort());
      expect(result.denied).toEqual([]);
    });

    test('should handle empty requested attributes', () => {
      const result = canAccessAttributes('products', 'read', testJWTs.defaultUser, []);
      expect(result.allowed).toEqual([]);
      expect(result.denied).toEqual([]);
    });

    test('should handle non-existent attributes', () => {
      const requestedAttributes = ['nonexistent1', 'nonexistent2'];
      const result = canAccessAttributes('products', 'read', testJWTs.admin, requestedAttributes);
      
      expect(result.allowed).toEqual([]);
      expect(result.denied.sort()).toEqual(requestedAttributes.sort());
    });
  });

  describe('filterByRBAC Function', () => {
    test('should filter data correctly for default user', () => {
      const result = filterByRBAC('products', 'read', testJWTs.defaultUser, sampleData.product);
      
      const expected = {
        att1: 'Product Name',
        att3: 'Description',
        att4: 'Category',
        att5: 'Price'
      };
      
      expect(result).toEqual(expected);
    });

    test('should filter data correctly for admin user', () => {
      const result = filterByRBAC('products', 'read', testJWTs.admin, sampleData.product);
      
      const expected = {
        att1: 'Product Name',
        att2: 'Secret Internal Info',
        att3: 'Description',
        att4: 'Category',
        att5: 'Price',
        att6: 'Internal Code',
        att7: 'Admin Notes'
      };
      
      expect(result).toEqual(expected);
    });

    test('should return empty object when no permissions', () => {
      const result = filterByRBAC('products', 'delete', testJWTs.defaultUser, sampleData.product);
      expect(result).toEqual({});
    });

    test('should handle null/undefined data', () => {
      expect(filterByRBAC('products', 'read', testJWTs.defaultUser, null)).toBeNull();
      expect(filterByRBAC('products', 'read', testJWTs.defaultUser, undefined)).toBeUndefined();
    });

    test('should handle non-object data', () => {
      expect(filterByRBAC('products', 'read', testJWTs.defaultUser, 'string')).toBe('string');
      expect(filterByRBAC('products', 'read', testJWTs.defaultUser, 123)).toBe(123);
    });

    test('should handle empty object', () => {
      const result = filterByRBAC('products', 'read', testJWTs.defaultUser, {});
      expect(result).toEqual({});
    });
  });

  describe('getUserPermissions Function', () => {
    test('should return all collections and operations for default user', () => {
      const result = getUserPermissions(testJWTs.defaultUser);
      
      expect(result).toHaveProperty('products');
      expect(result).toHaveProperty('orders');
      expect(result).toHaveProperty('users');
      expect(result).toHaveProperty('reports');
      
      expect(result.products.read.sort()).toEqual(['att1', 'att3', 'att5', 'att4'].sort());
      expect(result.products.write.sort()).toEqual(['att1', 'att2'].sort());
      expect(result.products.delete).toEqual([]);
    });

    test('should return all collections and operations for admin user', () => {
      const result = getUserPermissions(testJWTs.admin);
      
      expect(result.products.read.sort()).toEqual(['att1', 'att3', 'att5', 'att4', 'att2', 'att6', 'att7'].sort());
      expect(result.products.write.sort()).toEqual(['att1', 'att2', 'att3', 'att4', 'att6'].sort());
      expect(result.products.delete.sort()).toEqual(['att1', 'att2', 'att5', 'att6'].sort());
    });

    test('should handle manager permissions correctly', () => {
      const result = getUserPermissions(testJWTs.manager);
      
      expect(result.products.read.sort()).toEqual(['att1', 'att3', 'att5', 'att4', 'att2', 'att6'].sort());
      expect(result.products.delete.sort()).toEqual(['att2', 'att3'].sort());
      expect(result.orders.read.sort()).toEqual(['att1', 'att2', 'att3', 'att4', 'att5'].sort());
    });

    test('should handle invalid JWT', () => {
      const result = getUserPermissions('invalid.jwt');
      
      // Should still return structure but with empty arrays
      expect(result).toHaveProperty('products');
      expect(result.products.read).toEqual([]);
      expect(result.products.write).toEqual([]);
      expect(result.products.delete).toEqual([]);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('should handle JWT with single role property (not array)', () => {
      const result = RBACValidator('products', 'read', testJWTs.singleRoleUser);
      expect(result.sort()).toEqual(expectedResults.products.read.singleRoleUser.sort());
    });

    test('should handle user with no roles property', () => {
      const result = RBACValidator('products', 'read', testJWTs.noRoleUser);
      expect(result.sort()).toEqual(expectedResults.products.read.noRoleUser.sort());
    });

    test('should handle invalid operation', () => {
      const result = RBACValidator('products', 'invalid' as any, testJWTs.defaultUser);
      expect(result).toEqual([]);
    });

    test('should handle collection with no RBAC rules', () => {
      const result = RBACValidator('nonexistent', 'read', testJWTs.defaultUser);
      expect(result).toEqual([]);
    });
  });

  describe('Integration Tests', () => {
    test('complete workflow: get permissions, check access, filter data', () => {
      const user = testJWTs.defaultUser;
      
      // Get user permissions
      const permissions = getUserPermissions(user);
      const productReadPerms = permissions.products.read;
      
      // Check access to specific attributes
      const requestedAttrs = ['att1', 'att2', 'att3', 'att4', 'att5', 'att6'];
      const accessResult = canAccessAttributes('products', 'read', user, requestedAttrs);
      
      // Filter actual data
      const filteredData = filterByRBAC('products', 'read', user, sampleData.product);
      
      // Verify consistency
      expect(accessResult.allowed.sort()).toEqual(productReadPerms.sort());
      expect(Object.keys(filteredData).sort()).toEqual(productReadPerms.sort());
    });

    test('admin should have more permissions than default user', () => {
      const defaultPerms = getUserPermissions(testJWTs.defaultUser);
      const adminPerms = getUserPermissions(testJWTs.admin);
      
      // Admin should have at least as many permissions as default
      expect(adminPerms.products.read.length).toBeGreaterThanOrEqual(defaultPerms.products.read.length);
      expect(adminPerms.users.read.length).toBeGreaterThan(defaultPerms.users.read.length);
      
      // Admin should have delete permissions where default doesn't
      expect(adminPerms.users.delete.length).toBeGreaterThan(defaultPerms.users.delete.length);
    });
  });
});
