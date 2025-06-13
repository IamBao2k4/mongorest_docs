// src/main.ts

import { MongoDBAdapter } from '../../adapter/mongodb/mongodb'; 
import { HttpServer } from './http'; 

async function main() {
  // MongoDB configuration
  const mongoConfig = {
    connectionString: 'mongodb://thaily:Th%40i2004@localhost:27017/mongorest?authSource=admin',
    databaseName: 'mongorest',
    options: {
      maxPoolSize: 50,
      minPoolSize: 5,
      maxIdleTimeMS: 30000,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
    }
  };

  // HTTP Server configuration
  const serverConfig = {
    port: 3000,
    host: 'localhost'
  };

  try {
    // Initialize database adapter
    const dbAdapter = new MongoDBAdapter(mongoConfig);
    
    // Initialize HTTP server
    const server = new HttpServer(dbAdapter, serverConfig);

    // Setup graceful shutdown handlers
    const gracefulShutdown = () => server.gracefulShutdown();
    
    process.on('SIGINT', gracefulShutdown);
    process.on('SIGTERM', gracefulShutdown);
    process.on('uncaughtException', (error) => {
      console.error('Uncaught Exception:', error);
      gracefulShutdown();
    });
    process.on('unhandledRejection', (reason, promise) => {
      console.error('Unhandled Rejection at:', promise, 'reason:', reason);
      gracefulShutdown();
    });

    // Start the server
    await server.start();
    console.log('Application started successfully');

  } catch (error) {
    console.error('Failed to start application:', error);
    process.exit(1);
  }
}

// Run the application
main().catch((error) => {
  console.error('Application startup error:', error);
  process.exit(1);
});