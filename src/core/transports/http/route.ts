// handlers/route.handlers.ts
import { ServerResponse } from "http";
import { MongoDBAdapter } from "../../adapter/mongodb/main"; 
import { PostgRESTToMongoConverter } from "../../main/mongorest";
import { 
  ExtendedRequest, 
  ApiResponse 
} from "./api.types";
import {
  MultiCollectionConfig,
  MongoQuery,
  BulkUpdateOperation
} from "../../adapter/mongodb/types";
import { parseRequestBody, sendJsonResponse, sendErrorResponse } from "./utils";

export class RouteHandlers {
  constructor(
    private mongoAdapter: MongoDBAdapter,
    private converter: PostgRESTToMongoConverter
  ) {}

  /**
   * GET /api/:collection
   */
  async handleGetCollection(
    req: ExtendedRequest,
    res: ServerResponse,
    pathSegments: string[],
    query: Record<string, any>
  ): Promise<void> {
    try {
      const collection = pathSegments[1];
      console.log("Query params:", query);

      // Convert PostgREST params to MongoDB query
      const mongoQuery: MongoQuery = this.converter.convert(query, collection);
      
      const result = await this.mongoAdapter.queryCollection(collection, mongoQuery);

      const response: ApiResponse = {
        data: result.data,
        totalRecord: result.totalRecord,
        totalPage: result.totalPage,
        limit: result.limit,
        currentPage: result.currentPage,
      };

      sendJsonResponse(res, 200, response);
    } catch (error: any) {
      console.error("Database error:", error);
      sendErrorResponse(res, 500, "Database error", error.message);
    }
  }

  /**
   * GET /api/multi - Query multiple collections với config riêng
   * Body: MultiCollectionConfig
   */
  async handleMultiCollections(
    req: ExtendedRequest,
    res: ServerResponse,
    query: Record<string, any>
  ): Promise<void> {
    try {
      let collectionsConfig: MultiCollectionConfig;

      // Parse collections config từ query parameter hoặc request body
      if (query.collections) {
        try {
          collectionsConfig = JSON.parse(decodeURIComponent(query.collections));
        } catch (parseError) {
          return sendErrorResponse(
            res, 
            400, 
            "Invalid collections parameter", 
            "Must be valid JSON"
          );
        }
      } else {
        // Fallback: parse từ request body
        const body = await parseRequestBody(req);
        collectionsConfig = body.collections || body;
      }

      if (!collectionsConfig || typeof collectionsConfig !== 'object') {
        return sendErrorResponse(
          res, 
          400, 
          "Missing or invalid collections config"
        );
      }

      console.log("Collections config:", JSON.stringify(collectionsConfig, null, 2));

      const result = await this.mongoAdapter.queryMultipleCollections(collectionsConfig);
      sendJsonResponse(res, 200, result);
    } catch (error: any) {
      console.error("Multi-collection query error:", error);
      sendErrorResponse(res, 500, "Multi-collection query error", error.message);
    }
  }

  /**
   * POST /api/:collection
   */
  async handleSingleInsert(
    req: ExtendedRequest,
    res: ServerResponse,
    pathSegments: string[]
  ): Promise<void> {
    try {
      const collection = pathSegments[1];
      const body = await parseRequestBody(req);

      const result = await this.mongoAdapter.insertOne(collection, body);
      sendJsonResponse(res, 201, result);
    } catch (error: any) {
      console.error("Insert error:", error);
      sendErrorResponse(res, 500, "Insert error", error.message);
    }
  }

  /**
   * POST /api/:collection/bulk
   */
  async handleBulkInsert(
    req: ExtendedRequest,
    res: ServerResponse,
    pathSegments: string[]
  ): Promise<void> {
    try {
      const collection = pathSegments[1];
      const documents: any[] = await parseRequestBody(req);

      if (!Array.isArray(documents)) {
        return sendErrorResponse(res, 400, "Expected array of documents");
      }

      const result = await this.mongoAdapter.insertMany(collection, documents);
      sendJsonResponse(res, 201, result);
    } catch (error: any) {
      console.error("Bulk insert error:", error);
      sendErrorResponse(res, 500, "Bulk insert error", error.message);
    }
  }

  /**
   * PATCH /api/:collection/:id
   */
  async handleSingleUpdate(
    req: ExtendedRequest,
    res: ServerResponse,
    pathSegments: string[]
  ): Promise<void> {
    try {
      const collection = pathSegments[1];
      const id = pathSegments[2];
      const updateFields = await parseRequestBody(req);

      const result = await this.mongoAdapter.updateOne(collection, id, updateFields);
      sendJsonResponse(res, 200, result);
    } catch (error: any) {
      console.error("Update error:", error);
      sendErrorResponse(res, 500, "Update error", error.message);
    }
  }

  /**
   * PATCH /api/:collection/bulk
   */
  async handleBulkUpdate(
    req: ExtendedRequest,
    res: ServerResponse,
    pathSegments: string[]
  ): Promise<void> {
    try {
      const collection = pathSegments[1];
      const updates: BulkUpdateOperation[] = await parseRequestBody(req);

      if (!Array.isArray(updates)) {
        return sendErrorResponse(res, 400, "Expected array of update operations");
      }

      const result = await this.mongoAdapter.updateMany(collection, updates);
      sendJsonResponse(res, 200, result);
    } catch (error: any) {
      console.error("Bulk update error:", error);
      sendErrorResponse(res, 500, "Bulk update error", error.message);
    }
  }

  /**
   * DELETE /api/:collection/:id
   */
  async handleSingleDelete(
    req: ExtendedRequest,
    res: ServerResponse,
    pathSegments: string[]
  ): Promise<void> {
    try {
      const collection = pathSegments[1];
      const id = pathSegments[2];

      const result = await this.mongoAdapter.deleteOne(collection, id);
      sendJsonResponse(res, 200, result);
    } catch (error: any) {
      console.error("Delete error:", error);
      sendErrorResponse(res, 500, "Delete error", error.message);
    }
  }

  /**
   * DELETE /api/:collection/bulk
   */
  async handleBulkDelete(
    req: ExtendedRequest,
    res: ServerResponse,
    pathSegments: string[]
  ): Promise<void> {
    try {
      const collection = pathSegments[1];
      const filters: Record<string, any>[] = await parseRequestBody(req);

      if (!Array.isArray(filters)) {
        return sendErrorResponse(res, 400, "Expected array of filter objects");
      }

      const result = await this.mongoAdapter.deleteMany(collection, filters);
      sendJsonResponse(res, 200, result);
    } catch (error: any) {
      console.error("Bulk delete error:", error);
      sendErrorResponse(res, 500, "Bulk delete error", error.message);
    }
  }

  /**
   * GET /health
   */
  async handleHealthCheck(
    req: ExtendedRequest,
    res: ServerResponse
  ): Promise<void> {
    try {
      const collections = await this.mongoAdapter.healthCheck();

      const response = {
        status: "healthy" as const,
        database: "connected",
        collections,
        timestamp: new Date().toISOString(),
      };

      sendJsonResponse(res, 200, response);
    } catch (error: any) {
      const response = {
        status: "unhealthy" as const,
        database: "disconnected",
        error: error.message,
        timestamp: new Date().toISOString(),
      };

      sendJsonResponse(res, 500, response);
    }
  }
}