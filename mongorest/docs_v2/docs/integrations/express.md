---
sidebar_position: 1
---

# Express Integration

Tích hợp MongoREST với Express app.

## Basic Integration

```javascript
const express = require('express');
const MongoRest = require('mongorest');

const app = express();

// MongoREST middleware
const mongoRest = new MongoRest({
  db: 'mongodb://localhost:27017/mydb'
});

// Mount at specific path
app.use('/api', mongoRest.middleware());

// Your other routes
app.get('/', (req, res) => {
  res.send('Hello World');
});

app.listen(3000);
```

## Advanced Integration

```javascript
const express = require('express');
const MongoRest = require('mongorest');
const session = require('express-session');

const app = express();

// Session middleware
app.use(session({
  secret: 'your-secret',
  resave: false,
  saveUninitialized: true
}));

// Custom middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// MongoREST with custom config
const mongoRest = new MongoRest({
  db: 'mongodb://localhost:27017/mydb',
  
  // Share Express session
  getUserFromRequest: (req) => req.session.user,
  
  // Custom routes
  customRoutes: (router) => {
    router.get('/custom', (req, res) => {
      res.json({ message: 'Custom route' });
    });
  }
});

app.use('/api', mongoRest.middleware());

// Error handling
app.use((err, req, res, next) => {
  res.status(500).json({ error: err.message });
});

app.listen(3000);
```

## Sharing Authentication

```javascript
// Passport integration
const passport = require('passport');

app.use(passport.initialize());
app.use(passport.session());

const mongoRest = new MongoRest({
  db: 'mongodb://localhost:27017/mydb',
  
  // Use Passport user
  getUserFromRequest: (req) => req.user,
  
  // Check authentication
  hooks: {
    beforeRequest: async (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      next();
    }
  }
});
```

## Access MongoREST Instance

```javascript
// Get database access
app.get('/stats', async (req, res) => {
  const db = mongoRest.getDatabase();
  const userCount = await db.users.countDocuments();
  res.json({ users: userCount });
});
```