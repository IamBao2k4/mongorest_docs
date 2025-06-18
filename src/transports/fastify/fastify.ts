// src/transports/fastify/fastify.ts

import fastify, { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { IDatabaseAdapter } from "../../adapter/mongodb/types";
import { CachedMongoDBAdapter } from "../../adapter/redis/cacheMongo";
import { PostgRESTToMongoConverter } from "../../core/main/mongorest";
import { CacheRoutes } from "./cache";
import { SwaggerGenerator } from "./swagger";
import setupEcommerceRelationships from "../../core/config/relationships";

export interface FastifyServerConfig {
  port: number;
  host?: string;
}

interface RouteParams {
  collection?: string;
  id?: string;
}

interface QueryParams {
  [key: string]: string;
}

interface BulkParams extends RouteParams {
  '*': string;
}

export class FastifyServer {
  private server: FastifyInstance;
  private dbAdapter: IDatabaseAdapter;
  private converter: PostgRESTToMongoConverter;
  private config: FastifyServerConfig;
  private cacheRoutes: CacheRoutes | null = null;
  private swaggerGenerator: SwaggerGenerator;

  constructor(dbAdapter: IDatabaseAdapter, config: FastifyServerConfig) {
    this.dbAdapter = dbAdapter;
    this.config = config;

    // Setup cache routes if using CachedMongoDBAdapter
    if (dbAdapter instanceof CachedMongoDBAdapter) {
      this.cacheRoutes = new CacheRoutes(dbAdapter);
    }

    // Setup relationships and converter
    const registry = setupEcommerceRelationships();
    this.converter = new PostgRESTToMongoConverter(registry);

    // Initialize Swagger generator
    this.swaggerGenerator = new SwaggerGenerator();

    // Initialize Fastify server
    this.server = fastify({
      logger: {
        level: 'info'
      }
    });

    // Setup middleware and routes synchronously
    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware(): void {
    // CORS support
    this.server.register(require('@fastify/cors'), {
      origin: true,
      credentials: true,
      methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS']
    });

    // Request/Response timing
    this.server.addHook('onRequest', async (request, reply) => {
      request.startTime = process.hrtime.bigint();
    });

    this.server.addHook('onSend', async (request, reply, payload) => {
      if (request.startTime) {
        const end = process.hrtime.bigint();
        const durationMs = Number(end - request.startTime) / 1_000_000;
        reply.header('X-Response-Time', `${durationMs.toFixed(2)}ms`);
      }
      return payload;
    });
  }


  private setupRoutes(): void {
    // Cache management routes
    if (this.cacheRoutes) {
      this.server.register(async (fastify) => {
        await this.cacheRoutes!.registerRoutes(fastify);
      }, { prefix: '/api/cache' });
    }

    // Collection routes
    this.server.register(async (fastify) => {
      // GET /api/:collection
      fastify.get<{
        Params: RouteParams;
        Querystring: QueryParams;
      }>('/:collection', async (request, reply) => {
        return this.handleGetCollection(request, reply);
      });

      // GET /api/:collection/:id
      fastify.get<{
        Params: RouteParams;
        Querystring: QueryParams;
      }>('/:collection/:id', async (request, reply) => {
        return this.handleGetCollection(request, reply);
      });

      // POST /api/:collection
      fastify.post<{
        Params: RouteParams;
        Body: any;
      }>('/:collection', async (request, reply) => {
        return this.handlePostCollection(request, reply, false);
      });

      // POST /api/:collection/bulk
      fastify.post<{
        Params: BulkParams;
        Body: any;
      }>('/:collection/bulk', async (request, reply) => {
        return this.handlePostCollection(request, reply, true);
      });

      // PATCH /api/:collection/:id
      fastify.patch<{
        Params: RouteParams;
        Body: any;
      }>('/:collection/:id', async (request, reply) => {
        return this.handlePatchCollection(request, reply, false);
      });

      // PATCH /api/:collection/bulk
      fastify.patch<{
        Params: BulkParams;
        Body: any;
      }>('/:collection/bulk', async (request, reply) => {
        return this.handlePatchCollection(request, reply, true);
      });

      // DELETE /api/:collection/:id
      fastify.delete<{
        Params: RouteParams;
      }>('/:collection/:id', async (request, reply) => {
        return this.handleDeleteCollection(request, reply, false);
      });

      // DELETE /api/:collection/bulk
      fastify.delete<{
        Params: BulkParams;
        Body: any;
      }>('/:collection/bulk', async (request, reply) => {
        return this.handleDeleteCollection(request, reply, true);
      });
    }, { prefix: '/api' });
  }

  private convertPostgrestQuery(
    queryParams: Record<string, string>,
    collection: string
  ) {
    try {
      const mongoQuery = this.converter.convert(queryParams, collection);
      console.log("Converted query:", JSON.stringify(mongoQuery));
      return mongoQuery;
    } catch (error: any) {
      throw new Error(`Invalid query parameters: ${error.message}`);
    }
  }

  private getJwtFromRequest(request: FastifyRequest): string {
    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.split(' ')[1];
    }
    // Default JWT if not provided
    return "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyX2RlZmF1bHRfMDAxIiwidXNlcklkIjoidXNlcl9kZWZhdWx0XzAwMSIsInVzZXJuYW1lIjoiZ3Vlc3RfdXNlciIsInJvbGVzIjoiZGVmYXVsdCIsImlzQWRtaW4iOmZhbHNlfQ.p21cymLG1Q-flME3vyB84TP1Whd1zqQOmhAbWA3bjPs";
  }

  private async handleGetCollection(
    request: FastifyRequest<{
      Params: RouteParams;
      Querystring: QueryParams;
    }>,
    reply: FastifyReply
  ): Promise<any> {
    try {
      const { collection } = request.params;
      const queryParams = request.query || {};

      if (!collection) {
        return reply.code(400).send({ error: "Collection not specified" });
      }

      const mongoQuery = this.convertPostgrestQuery(queryParams, collection);
      const jwt = this.getJwtFromRequest(request);
      const result = await this.dbAdapter.find(collection, mongoQuery, jwt);

      // Add cache status header if using cached adapter
      if (this.dbAdapter instanceof CachedMongoDBAdapter) {
        reply.header('X-Cache-Enabled', this.dbAdapter.isCacheActive() ? 'true' : 'false');
      }

      return result;
    } catch (error: any) {
      console.error("Database error:", error);
      return reply.code(500).send({ error: "Database error", details: error.message });
    }
  }

  private async handlePostCollection(
    request: FastifyRequest<{
      Params: RouteParams | BulkParams;
      Body: any;
    }>,
    reply: FastifyReply,
    isBulk: boolean
  ): Promise<any> {
    try {
      const { collection } = request.params;
      const body: any = request.body;

      if (!collection) {
        return reply.code(400).send({ error: "Collection not specified" });
      }

      let result;
      if (isBulk) {
        result = await this.dbAdapter.insertMany(collection, body);
      } else {
        result = await this.dbAdapter.insertOne(collection, body);
      }

      return reply.code(201).send(result);
    } catch (error: any) {
      console.error("Insert error:", error);
      return reply.code(500).send({ error: "Insert error", details: error.message });
    }
  }

  private async handlePatchCollection(
    request: FastifyRequest<{
      Params: RouteParams | BulkParams;
      Body: any;
    }>,
    reply: FastifyReply,
    isBulk: boolean
  ): Promise<any> {
    try {
      const params = request.params;
      const body: any = request.body;

      if (!params.collection) {
        return reply.code(400).send({ error: "Collection not specified" });
      }

      let result;
      if (isBulk) {
        result = await this.dbAdapter.updateMany(params.collection, body);
      } else {
        const routeParams = params as RouteParams;
        if (!routeParams.id) {
          return reply.code(400).send({ error: "ID required for single update operation" });
        }
        result = await this.dbAdapter.updateOne(params.collection, routeParams.id, body);
      }

      return result;
    } catch (error: any) {
      console.error("Update error:", error);
      return reply.code(500).send({ error: "Update error", details: error.message });
    }
  }

  private async handleDeleteCollection(
    request: FastifyRequest<{
      Params: RouteParams | BulkParams;
      Body?: any;
    }>,
    reply: FastifyReply,
    isBulk: boolean
  ): Promise<any> {
    try {
      const params = request.params;

      if (!params.collection) {
        return reply.code(400).send({ error: "Collection not specified" });
      }

      let result;
      if (isBulk) {
        const body: any = request.body;
        result = await this.dbAdapter.deleteMany(params.collection, body);
      } else {
        const routeParams = params as RouteParams;
        if (!routeParams.id) {
          return reply.code(400).send({ error: "ID required for single delete operation" });
        }
        result = await this.dbAdapter.deleteOne(params.collection, routeParams.id);
      }

      return result;
    } catch (error: any) {
      console.error("Delete error:", error);
      return reply.code(500).send({ error: "Delete error", details: error.message });
    }
  }

  async start(): Promise<void> {
    // Ensure database is connected
    if (!this.dbAdapter.isConnected()) {
      await this.dbAdapter.connect();
    }

    try {
      // Register Swagger before starting
      await this.swaggerGenerator.registerSwagger(this.server);
      
      await this.server.listen({
        port: this.config.port,
        host: this.config.host || 'localhost'
      });

      const cacheStatus =
        this.dbAdapter instanceof CachedMongoDBAdapter
          ? this.dbAdapter.isCacheActive()
            ? "with Redis cache"
            : "cache disabled"
          : "no cache layer";

      console.log(
        `Fastify server running on ${this.config.host || "localhost"}:${
          this.config.port
        } ${cacheStatus}`
      );

      if (this.cacheRoutes) {
        console.log("Cache management endpoints available at /api/cache/*");
      }
      
      console.log(`Swagger documentation available at http://localhost:${this.config.port}/docs`);
    } catch (error) {
      console.error('Error starting Fastify server:', error);
      throw error;
    }
  }

  async stop(): Promise<void> {
    try {
      await this.server.close();
      console.log("Fastify Server stopped");
    } catch (error) {
      console.error('Error stopping Fastify server:', error);
      throw error;
    }
  }

  async gracefulShutdown(): Promise<void> {
    console.log("Shutting down Fastify server gracefully...");

    try {
      await this.stop();
      await this.dbAdapter.disconnect();
      console.log("Graceful shutdown completed");
      process.exit(0);
    } catch (error) {
      console.error("Error during graceful shutdown:", error);
      process.exit(1);
    }
  }
}

// Extend FastifyRequest interface to include startTime
declare module 'fastify' {
  interface FastifyRequest {
    startTime?: bigint;
  }
}