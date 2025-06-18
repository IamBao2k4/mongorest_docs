# database.ts

## Overview
`DataBase` class provides a base implementation for Role-Based Access Control (RBAC) filtering on database operations.

## Class: DataBase

### Purpose
Base class that integrates RBAC (Role-Based Access Control) filtering for database operations, ensuring that data access is properly authorized based on user permissions.

### Methods

#### `protected RbacDatabase(data: any, jwt: string, collection: string): any`

Applies RBAC filtering to database query results.

**Parameters:**
- `data`: The data to be filtered (query results from database)
- `jwt`: JSON Web Token containing user authentication and role information
- `collection`: The name of the collection being accessed

**Returns:**
- Filtered data based on user's permissions

**Operation:**
1. Logs the input parameters for debugging
2. Calls `filterByRBAC` function to apply permission-based filtering
3. Returns only the data that the user has permission to read

### RBAC Integration

The class uses the `filterByRBAC` function from the RBAC validator module to:
- Verify user permissions for the specified collection
- Filter out data that the user doesn't have permission to access
- Enforce "read" operation permissions

### Usage Pattern

This is a protected method intended to be used by classes that extend `DataBase`:

```typescript
class MyDatabaseAdapter extends DataBase {
  async find(collection: string, query: any, jwt: string) {
    const results = await this.performQuery(collection, query);
    // Apply RBAC filtering before returning results
    return this.RbacDatabase(results, jwt, collection);
  }
}
```

### Security Features

- **JWT-based Authentication**: Uses JWT tokens to identify users and their roles
- **Collection-level Permissions**: Filters data based on collection-specific permissions
- **Read Operation Focus**: Currently implements filtering for read operations
- **Logging**: Provides debugging information for security auditing

### Design Considerations

1. **Inheritance Pattern**: Designed as a base class for database adapters
2. **Protected Method**: Not directly accessible, must be used through inheritance
3. **Separation of Concerns**: Separates RBAC logic from database operations
4. **Flexibility**: Can be extended to support other RBAC operations (write, update, delete)

### Future Enhancements

Potential areas for extension:
- Support for other RBAC operations (create, update, delete)
- Caching of permission checks
- More granular field-level permissions
- Performance optimizations for large datasets