---
sidebar_position: 2
---

# React Integration

Sử dụng MongoREST với React applications.

## API Client

```javascript
// api/client.js
class MongoRestClient {
  constructor(baseURL = 'http://localhost:3000/api') {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('token');
  }

  async request(path, options = {}) {
    const response = await fetch(`${this.baseURL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': this.token ? `Bearer ${this.token}` : '',
        ...options.headers
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // CRUD operations
  find(collection, query = {}) {
    const queryString = new URLSearchParams(query).toString();
    return this.request(`/${collection}?${queryString}`);
  }

  findOne(collection, id) {
    return this.request(`/${collection}/${id}`);
  }

  create(collection, data) {
    return this.request(`/${collection}`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  update(collection, id, data) {
    return this.request(`/${collection}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  delete(collection, id) {
    return this.request(`/${collection}/${id}`, {
      method: 'DELETE'
    });
  }
}

export default new MongoRestClient();
```

## React Hooks

```javascript
// hooks/useMongoRest.js
import { useState, useEffect } from 'react';
import api from '../api/client';

export function useCollection(collection, query = {}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await api.find(collection, query);
        setData(result);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [collection, JSON.stringify(query)]);

  const refresh = () => {
    fetchData();
  };

  return { data, loading, error, refresh };
}

export function useDocument(collection, id) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await api.findOne(collection, id);
        setData(result);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [collection, id]);

  return { data, loading, error };
}
```

## Component Example

```javascript
// components/UserList.js
import React from 'react';
import { useCollection } from '../hooks/useMongoRest';

function UserList() {
  const { data: users, loading, error, refresh } = useCollection('users', {
    order: 'name.asc',
    limit: 20
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1>Users</h1>
      <button onClick={refresh}>Refresh</button>
      <ul>
        {users.map(user => (
          <li key={user._id}>{user.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

## Real-time Updates

```javascript
// hooks/useRealtime.js
import { useEffect } from 'react';

export function useRealtime(collection, onUpdate) {
  useEffect(() => {
    const ws = new WebSocket('ws://localhost:3000/ws');

    ws.onopen = () => {
      ws.send(JSON.stringify({
        action: 'subscribe',
        collection
      }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      onUpdate(data);
    };

    return () => {
      ws.close();
    };
  }, [collection]);
}