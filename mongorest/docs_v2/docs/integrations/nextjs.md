---
sidebar_position: 4
---

# Next.js Integration

Sử dụng MongoREST với Next.js applications.

## API Routes

```javascript
// pages/api/[...mongorest].js
import MongoRest from 'mongorest';

const mongoRest = new MongoRest({
  db: process.env.MONGODB_URI,
  auth: {
    secret: process.env.JWT_SECRET
  }
});

export default async function handler(req, res) {
  // Remove /api prefix
  req.url = req.url.replace(/^\/api/, '');
  
  return mongoRest.handleRequest(req, res);
}
```

## Server-Side Data Fetching

```javascript
// lib/mongorest-client.js
class MongoRestSSR {
  constructor(baseURL) {
    this.baseURL = baseURL || process.env.NEXT_PUBLIC_API_URL;
  }

  async find(collection, query = {}, options = {}) {
    const queryString = new URLSearchParams(query).toString();
    const url = `${this.baseURL}/${collection}?${queryString}`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': options.token ? `Bearer ${options.token}` : ''
      },
      next: { revalidate: options.revalidate || 60 }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch ${collection}`);
    }

    return response.json();
  }
}

export const mongorest = new MongoRestSSR();
```

## App Router (Server Components)

```javascript
// app/users/page.js
import { mongorest } from '@/lib/mongorest-client';

export default async function UsersPage() {
  const users = await mongorest.find('users', {
    order: 'createdAt.desc',
    limit: 20
  });

  return (
    <div>
      <h1>Users</h1>
      <ul>
        {users.map(user => (
          <li key={user._id}>{user.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

## Client Components

```javascript
// app/users/UserForm.js
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function UserForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        router.refresh();
        e.target.reset();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" placeholder="Name" required />
      <input name="email" type="email" placeholder="Email" required />
      <button type="submit" disabled={loading}>
        {loading ? 'Saving...' : 'Save'}
      </button>
    </form>
  );
}
```

## Server Actions

```javascript
// app/users/actions.js
'use server';

import { revalidatePath } from 'next/cache';
import { mongorest } from '@/lib/mongorest-client';

export async function createUser(formData) {
  const data = {
    name: formData.get('name'),
    email: formData.get('email')
  };

  await fetch(`${process.env.API_URL}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  revalidatePath('/users');
}

export async function deleteUser(id) {
  await fetch(`${process.env.API_URL}/users/${id}`, {
    method: 'DELETE'
  });

  revalidatePath('/users');
}
```

## Middleware for Auth

```javascript
// middleware.js
import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(request) {
  const token = request.cookies.get('token')?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    await jwtVerify(token, secret);
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/protected/:path*']
};
```

## Environment Setup

```bash
# .env.local
MONGODB_URI=mongodb://localhost:27017/mydb
JWT_SECRET=your-secret-key
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```