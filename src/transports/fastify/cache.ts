// src/transports/fastify/cache.ts

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { CachedMongoDBAdapter } from "../../adapter/redis/cacheMongo";

interface CacheStatsParams {}

interface CacheActionParams {
  action: string;
}

interface CacheCollectionParams {
  action: string;
  collection: string;
}

interface WarmupBody {
  queries: any[];
}

export class CacheRoutes {
  private dbAdapter: CachedMongoDBAdapter;

  constructor(dbAdapter: CachedMongoDBAdapter) {
    this.dbAdapter = dbAdapter;
  }

  async registerRoutes(fastify: FastifyInstance): Promise<void> {
    // GET /api/cache/stats
    fastify.get<{
      Params: CacheStatsParams;
    }>('/stats', async (request, reply) => {
      return this.handleGetStats(request, reply);
    });

    // GET /api/cache/status
    fastify.get<{
      Params: CacheStatsParams;
    }>('/status', async (request, reply) => {
      return this.handleGetStatus(request, reply);
    });

    // DELETE /api/cache/clear
    fastify.delete<{
      Params: CacheStatsParams;
    }>('/clear', async (request, reply) => {
      return this.handleClearAllCache(request, reply);
    });

    // DELETE /api/cache/clear/:collection
    fastify.delete<{
      Params: { collection: string };
    }>('/clear/:collection', async (request, reply) => {
      return this.handleClearCollectionCache(request, reply);
    });

    // DELETE /api/cache/invalidate/:collection
    fastify.delete<{
      Params: { collection: string };
    }>('/invalidate/:collection', async (request, reply) => {
      return this.handleInvalidateCache(request, reply);
    });

    // POST /api/cache/warmup/:collection
    fastify.post<{
      Params: { collection: string };
      Body: WarmupBody;
    }>('/warmup/:collection', async (request, reply) => {
      return this.handleWarmupCache(request, reply);
    });
  }

  private getJwtFromRequest(request: FastifyRequest): string {
    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.split(' ')[1];
    }
    // Default JWT if not provided
    return "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyX2RlZmF1bHRfMDAxIiwidXNlcklkIjoidXNlcl9kZWZhdWx0XzAwMSIsInVzZXJuYW1lIjoiZ3Vlc3RfdXNlciIsInJvbGVzIjoiZGVmYXVsdCIsImlzQWRtaW4iOmZhbHNlfQ.p21cymLG1Q-flME3vyB84TP1Whd1zqQOmhAbWA3bjPs";
  }

  private async handleGetStats(
    request: FastifyRequest<{ Params: CacheStatsParams }>,
    reply: FastifyReply
  ): Promise<any> {
    try {
      const stats = await this.dbAdapter.getCacheStats();
      const config = this.dbAdapter.getCacheConfig();
      
      return {
        stats,
        config,
        active: this.dbAdapter.isCacheActive(),
      };
    } catch (error: any) {
      console.error("Cache stats error:", error);
      return reply.code(500).send({ error: "Cache stats error", details: error.message });
    }
  }

  private async handleGetStatus(
    request: FastifyRequest<{ Params: CacheStatsParams }>,
    reply: FastifyReply
  ): Promise<any> {
    try {
      return {
        active: this.dbAdapter.isCacheActive(),
        config: this.dbAdapter.getCacheConfig(),
      };
    } catch (error: any) {
      console.error("Cache status error:", error);
      return reply.code(500).send({ error: "Cache status error", details: error.message });
    }
  }

  private async handleClearAllCache(
    request: FastifyRequest<{ Params: CacheStatsParams }>,
    reply: FastifyReply
  ): Promise<any> {
    try {
      await this.dbAdapter.clearCache();
      return {
        message: "All cache cleared",
      };
    } catch (error: any) {
      console.error("Cache clear error:", error);
      return reply.code(500).send({ error: "Cache clear error", details: error.message });
    }
  }

  private async handleClearCollectionCache(
    request: FastifyRequest<{ Params: { collection: string } }>,
    reply: FastifyReply
  ): Promise<any> {
    try {
      const { collection } = request.params;
      await this.dbAdapter.clearCache(collection);
      return {
        message: `Cache cleared for collection: ${collection}`,
      };
    } catch (error: any) {
      console.error("Collection cache clear error:", error);
      return reply.code(500).send({ error: "Collection cache clear error", details: error.message });
    }
  }

  private async handleInvalidateCache(
    request: FastifyRequest<{ Params: { collection: string } }>,
    reply: FastifyReply
  ): Promise<any> {
    try {
      const { collection } = request.params;
      await this.dbAdapter.clearCache(collection);
      return {
        message: `Cache invalidated for collection: ${collection}`,
      };
    } catch (error: any) {
      console.error("Cache invalidate error:", error);
      return reply.code(500).send({ error: "Cache invalidate error", details: error.message });
    }
  }

  private async handleWarmupCache(
    request: FastifyRequest<{
      Params: { collection: string };
      Body: WarmupBody;
    }>,
    reply: FastifyReply
  ): Promise<any> {
    try {
      const { collection } = request.params;
      const { queries = [] } = request.body || {};

      if (!Array.isArray(queries)) {
        return reply.code(400).send({ error: "Queries must be an array" });
      }

      const jwt = this.getJwtFromRequest(request);
      await this.dbAdapter.warmupCache(collection, queries, jwt);
      
      return {
        message: `Cache warmed up for collection: ${collection}`,
        queryCount: queries.length,
      };
    } catch (error: any) {
      console.error("Cache warmup error:", error);
      return reply.code(500).send({ error: "Cache warmup error", details: error.message });
    }
  }
}