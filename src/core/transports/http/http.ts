// src/server/HttpServer.ts

import * as http from "http";
import * as url from "url";
import { IDatabaseAdapter } from "../../adapter/mongodb/types";
import { CachedMongoDBAdapter } from "../../adapter/redis/cacheMongo";
import { PostgRESTToMongoConverter } from "../../main/mongorest";
import { CacheRoutes } from "./cache";
import setupEcommerceRelationships from "../../config/relationships";

export interface HttpServerConfig {
  port: number;
  host?: string;
}

export class HttpServer {
  private server: http.Server;
  private dbAdapter: IDatabaseAdapter;
  private converter: PostgRESTToMongoConverter;
  private config: HttpServerConfig;
  private cacheRoutes: CacheRoutes | null = null;

  constructor(dbAdapter: IDatabaseAdapter, config: HttpServerConfig) {
    this.dbAdapter = dbAdapter;
    this.config = config;

    // Setup cache routes if using CachedMongoDBAdapter
    if (dbAdapter instanceof CachedMongoDBAdapter) {
      this.cacheRoutes = new CacheRoutes(dbAdapter);
    }

    // Setup relationships and converter
    const registry = setupEcommerceRelationships();
    this.converter = new PostgRESTToMongoConverter(registry);

    this.server = http.createServer(this.handleRequest.bind(this));
  }

  private parseBody(req: http.IncomingMessage): Promise<any> {
    return new Promise((resolve, reject) => {
      let body = "";

      req.on("data", (chunk) => {
        body += chunk.toString();
      });

      req.on("end", () => {
        try {
          if (body) {
            resolve(JSON.parse(body));
          } else {
            resolve({});
          }
        } catch (error) {
          reject(new Error("Invalid JSON body"));
        }
      });

      req.on("error", reject);
    });
  }

  private parsePath(pathname: string): {
    collection?: string;
    id?: string;
    isBulk: boolean;
  } {
    const parts = pathname.split("/").filter((part) => part);

    // Expected format: /api/{collection} or /api/{collection}/{id} or /api/{collection}/bulk
    if (parts.length >= 2 && parts[0] === "api") {
      const collection = parts[1];
      const isBulk = parts[2] === "bulk";
      const id = !isBulk && parts[2] ? parts[2] : undefined;

      return { collection, id, isBulk };
    }

    return { isBulk: false };
  }

  private setCorsHeaders(res: http.ServerResponse): void {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, PATCH, DELETE, OPTIONS"
    );
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );
  }

  private setResponseHeaders(res: http.ServerResponse): void {
    this.setCorsHeaders(res);
    res.setHeader("Content-Type", "application/json");
  }

  private sendResponse(
    res: http.ServerResponse,
    statusCode: number,
    data: any
  ): void {
    this.setResponseHeaders(res);
    res.statusCode = statusCode;
    res.end(JSON.stringify(data));
  }

  private sendError(
    res: http.ServerResponse,
    statusCode: number,
    message: string,
    details?: string
  ): void {
    this.sendResponse(res, statusCode, {
      error: message,
      ...(details && { details }),
    });
  }

  private measureResponseTime(
    req: http.IncomingMessage,
    res: http.ServerResponse
  ): void {
    const start = process.hrtime.bigint();

    const originalEnd = res.end;
    res.end = function (...args: any[]) {
      const end = process.hrtime.bigint();
      const durationMs = Number(end - start) / 1_000_000;
      res.setHeader("X-Response-Time", `${durationMs.toFixed(2)}ms`);

      // Add cache hit/miss header if available
      if (res.getHeader("X-Cache-Status")) {
        // Cache status already set by cache layer
      }

      return originalEnd.apply(this, args as any);
    };
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

  private async handleGetCollection(
    req: http.IncomingMessage,
    res: http.ServerResponse,
    collection: string,
    queryParams: Record<string, string>
  ): Promise<void> {
    try {
      const mongoQuery = this.convertPostgrestQuery(queryParams, collection);
      let jwt = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyX2RlZmF1bHRfMDAxIiwidXNlcklkIjoidXNlcl9kZWZhdWx0XzAwMSIsInVzZXJuYW1lIjoiZ3Vlc3RfdXNlciIsInJvbGVzIjoiZGVmYXVsdCIsImlzQWRtaW4iOmZhbHNlfQ.p21cymLG1Q-flME3vyB84TP1Whd1zqQOmhAbWA3bjPs"
      if (res.getHeader("Bearer Token")) {
        jwt =
        (res.getHeader("Bearer Token") as string).split(" ")[1]
      }
      const result = await this.dbAdapter.find(collection, mongoQuery, jwt);

      // Add cache status header if using cached adapter
      if (this.dbAdapter instanceof CachedMongoDBAdapter) {
        res.setHeader(
          "X-Cache-Enabled",
          this.dbAdapter.isCacheActive() ? "true" : "false"
        );
      }

      this.sendResponse(res, 200, result);
    } catch (error: any) {
      console.error("Database error:", error);
      this.sendError(res, 500, "Database error", error.message);
    }
  }

  private async handlePostCollection(
    req: http.IncomingMessage,
    res: http.ServerResponse,
    collection: string,
    isBulk: boolean
  ): Promise<void> {
    try {
      const body = await this.parseBody(req);

      if (isBulk) {
        const result = await this.dbAdapter.insertMany(collection, body);
        this.sendResponse(res, 201, result);
      } else {
        const result = await this.dbAdapter.insertOne(collection, body);
        this.sendResponse(res, 201, result);
      }
    } catch (error: any) {
      console.error("Insert error:", error);
      this.sendError(res, 500, "Insert error", error.message);
    }
  }

  private async handlePatchCollection(
    req: http.IncomingMessage,
    res: http.ServerResponse,
    collection: string,
    id: string | undefined,
    isBulk: boolean
  ): Promise<void> {
    try {
      const body = await this.parseBody(req);

      if (isBulk) {
        const result = await this.dbAdapter.updateMany(collection, body);
        this.sendResponse(res, 200, result);
      } else if (id) {
        const result = await this.dbAdapter.updateOne(collection, id, body);
        this.sendResponse(res, 200, result);
      } else {
        this.sendError(res, 400, "ID required for single update operation");
      }
    } catch (error: any) {
      console.error("Update error:", error);
      this.sendError(res, 500, "Update error", error.message);
    }
  }

  private async handleDeleteCollection(
    req: http.IncomingMessage,
    res: http.ServerResponse,
    collection: string,
    id: string | undefined,
    isBulk: boolean
  ): Promise<void> {
    try {
      if (isBulk) {
        const body = await this.parseBody(req);
        const result = await this.dbAdapter.deleteMany(collection, body);
        this.sendResponse(res, 200, result);
      } else if (id) {
        const result = await this.dbAdapter.deleteOne(collection, id);
        this.sendResponse(res, 200, result);
      } else {
        this.sendError(res, 400, "ID required for single delete operation");
      }
    } catch (error: any) {
      console.error("Delete error:", error);
      this.sendError(res, 500, "Delete error", error.message);
    }
  }

  private async handleRequest(
    req: http.IncomingMessage,
    res: http.ServerResponse
  ): Promise<void> {
    // Add response time measurement
    this.measureResponseTime(req, res);

    // Handle CORS preflight
    if (req.method === "OPTIONS") {
      this.setCorsHeaders(res);
      res.statusCode = 200;
      res.end();
      return;
    }

    const parsedUrl = url.parse(req.url || "", true);
    const pathname = parsedUrl.pathname || "";
    const queryParams = parsedUrl.query as Record<string, string>;

    // Check if this is a cache management request
    if (this.cacheRoutes && pathname.startsWith("/api/cache")) {
      const handled = await this.cacheRoutes.handleCacheRequest(req, res);
      if (handled) {
        return;
      }
    }

    const { collection, id, isBulk } = this.parsePath(pathname);

    if (!collection) {
      this.sendError(res, 404, "Collection not specified");
      return;
    }

    try {
      switch (req.method) {
        case "GET":
          await this.handleGetCollection(req, res, collection, queryParams);
          break;

        case "POST":
          await this.handlePostCollection(req, res, collection, isBulk);
          break;

        case "PATCH":
          await this.handlePatchCollection(req, res, collection, id, isBulk);
          break;

        case "DELETE":
          await this.handleDeleteCollection(req, res, collection, id, isBulk);
          break;

        default:
          this.sendError(res, 405, "Method not allowed");
      }
    } catch (error: any) {
      console.error("Request handling error:", error);
      this.sendError(res, 500, "Internal server error", error.message);
    }
  }

  async start(): Promise<void> {
    // Ensure database is connected
    if (!this.dbAdapter.isConnected()) {
      await this.dbAdapter.connect();
    }

    return new Promise((resolve) => {
      this.server.listen(this.config.port, this.config.host, () => {
        const cacheStatus =
          this.dbAdapter instanceof CachedMongoDBAdapter
            ? this.dbAdapter.isCacheActive()
              ? "with Redis cache"
              : "cache disabled"
            : "no cache layer";

        console.log(
          `Server running on ${this.config.host || "localhost"}:${
            this.config.port
          } ${cacheStatus}`
        );

        if (this.cacheRoutes) {
          console.log("Cache management endpoints available at /api/cache/*");
        }

        resolve();
      });
    });
  }

  async stop(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.server.close((error) => {
        if (error) {
          reject(error);
        } else {
          console.log("HTTP Server stopped");
          resolve();
        }
      });
    });
  }

  async gracefulShutdown(): Promise<void> {
    console.log("Shutting down gracefully...");

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
