---
sidebar_position: 4
---

# Hooks Reference

Chi tiết về các hooks có sẵn.

## Request Hooks

### beforeRequest
```javascript
hooks: {
  beforeRequest: async (req, res, next) => {
    // Modify request
    req.customData = { timestamp: Date.now() };
    next();
  }
}
```

### afterRequest
```javascript
hooks: {
  afterRequest: async (req, res) => {
    // Log request
    console.log(`${req.method} ${req.path} - ${res.statusCode}`);
  }
}
```

## Database Hooks

### beforeInsert
```javascript
hooks: {
  beforeInsert: async (collection, data) => {
    // Add timestamps
    data.createdAt = new Date();
    data.createdBy = req.user?.id;
    return data;
  }
}
```

### afterInsert
```javascript
hooks: {
  afterInsert: async (collection, result) => {
    // Send notification
    await notificationService.send({
      type: 'new_document',
      collection,
      id: result._id
    });
  }
}
```

### beforeUpdate
```javascript
hooks: {
  beforeUpdate: async (collection, id, data) => {
    // Add update timestamp
    data.updatedAt = new Date();
    return data;
  }
}
```

### beforeDelete
```javascript
hooks: {
  beforeDelete: async (collection, id) => {
    // Check permissions
    const doc = await db[collection].findOne({ _id: id });
    if (doc.protected) {
      throw new Error('Cannot delete protected document');
    }
  }
}
```

## Query Hooks

### beforeQuery
```javascript
hooks: {
  beforeQuery: async (collection, query) => {
    // Add default filters
    if (collection === 'users') {
      query.active = true;
    }
    return query;
  }
}
```

### afterQuery
```javascript
hooks: {
  afterQuery: async (collection, results) => {
    // Transform results
    return results.map(doc => ({
      ...doc,
      fullName: `${doc.firstName} ${doc.lastName}`
    }));
  }
}
```

## Global Hooks

```javascript
hooks: {
  '*': {
    beforeInsert: async (collection, data) => {
      // Applies to all collections
      data._metadata = {
        version: 1,
        created: new Date()
      };
      return data;
    }
  }
}