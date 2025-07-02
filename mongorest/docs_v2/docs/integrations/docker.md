---
sidebar_position: 3
---

# Docker Deployment

Deploy MongoREST với Docker.

## Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy config
COPY mongorest.config.js ./

# Expose port
EXPOSE 3000

# Start server
CMD ["npx", "mongorest"]
```

## Docker Compose

```yaml
version: '3.8'

services:
  mongorest:
    build: .
    ports:
      - "3000:3000"
    environment:
      - MONGO_URL=mongodb://mongo:27017/mydb
      - JWT_SECRET=your-secret-key
    depends_on:
      - mongo
    restart: unless-stopped

  mongo:
    image: mongo:6
    volumes:
      - mongo_data:/data/db
    ports:
      - "27017:27017"
    restart: unless-stopped

volumes:
  mongo_data:
```

## Environment Configuration

```bash
# .env.production
MONGO_URL=mongodb://mongo:27017/mydb
NODE_ENV=production
PORT=3000
JWT_SECRET=your-production-secret
```

## Build & Run

```bash
# Build image
docker build -t mongorest-app .

# Run with compose
docker-compose up -d

# View logs
docker-compose logs -f mongorest
```

## Health Check

```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
  interval: 30s
  timeout: 10s
  retries: 3
```
