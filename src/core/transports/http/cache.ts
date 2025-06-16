// src/server/CacheRoutes.ts

import * as http from 'http';
import * as url from 'url';
import { CachedMongoDBAdapter } from '../../adapter/redis/cacheMongo'; 

export class CacheRoutes {
  private dbAdapter: CachedMongoDBAdapter;

  constructor(dbAdapter: CachedMongoDBAdapter) {
    this.dbAdapter = dbAdapter;
  }

  private sendResponse(res: http.ServerResponse, statusCode: number, data: any): void {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.statusCode = statusCode;
    res.end(JSON.stringify(data));
  }

  private sendError(res: http.ServerResponse, statusCode: number, message: string): void {
    this.sendResponse(res, statusCode, { error: message });
  }

  async handleCacheRequest(req: http.IncomingMessage, res: http.ServerResponse): Promise<boolean> {
    const parsedUrl = url.parse(req.url || '', true);
    const pathname = parsedUrl.pathname || '';
    const queryParams = parsedUrl.query as Record<string, string>;

    // Check if this is a cache management request
    if (!pathname.startsWith('/api/cache')) {
      return false; // Not a cache request
    }

    try {
      const pathParts = pathname.split('/').filter(part => part);
      // Expected: /api/cache/{action} or /api/cache/{action}/{collection}
      
      if (pathParts.length < 3) {
        this.sendError(res, 400, 'Invalid cache endpoint');
        return true;
      }

      const action = pathParts[2]; // cache action
      const collection = pathParts[3]; // optional collection name

      switch (req.method) {
        case 'GET':
          await this.handleCacheGet(action, collection, res);
          break;

        case 'DELETE':
          await this.handleCacheDelete(action, collection, res);
          break;

        case 'POST':
          await this.handleCachePost(action, collection, req, res);
          break;

        default:
          this.sendError(res, 405, 'Method not allowed for cache endpoints');
      }

      return true; // Cache request handled

    } catch (error: any) {
      console.error('Cache route error:', error);
      this.sendError(res, 500, error.message);
      return true;
    }
  }

  private async handleCacheGet(action: string, collection: string | undefined, res: http.ServerResponse): Promise<void> {
    switch (action) {
      case 'stats':
        const stats = await this.dbAdapter.getCacheStats();
        const config = this.dbAdapter.getCacheConfig();
        this.sendResponse(res, 200, {
          stats,
          config,
          active: this.dbAdapter.isCacheActive()
        });
        break;

      case 'status':
        this.sendResponse(res, 200, {
          active: this.dbAdapter.isCacheActive(),
          config: this.dbAdapter.getCacheConfig()
        });
        break;

      default:
        this.sendError(res, 400, `Unknown cache action: ${action}`);
    }
  }

  private async handleCacheDelete(action: string, collection: string | undefined, res: http.ServerResponse): Promise<void> {
    switch (action) {
      case 'clear':
        if (collection) {
          await this.dbAdapter.clearCache(collection);
          this.sendResponse(res, 200, { 
            message: `Cache cleared for collection: ${collection}` 
          });
        } else {
          await this.dbAdapter.clearCache();
          this.sendResponse(res, 200, { 
            message: 'All cache cleared' 
          });
        }
        break;

      case 'invalidate':
        if (!collection) {
          this.sendError(res, 400, 'Collection name required for invalidate action');
          return;
        }
        await this.dbAdapter.clearCache(collection);
        this.sendResponse(res, 200, { 
          message: `Cache invalidated for collection: ${collection}` 
        });
        break;

      default:
        this.sendError(res, 400, `Unknown cache delete action: ${action}`);
    }
  }

  private async handleCachePost(action: string, collection: string | undefined, req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
    switch (action) {
      case 'warmup':
        if (!collection) {
          this.sendError(res, 400, 'Collection name required for warmup action');
          return;
        }

        const body = await this.parseBody(req);
        const queries = body.queries || [];

        if (!Array.isArray(queries)) {
          this.sendError(res, 400, 'Queries must be an array');
          return;
        }

        await this.dbAdapter.warmupCache(collection, queries);
        this.sendResponse(res, 200, { 
          message: `Cache warmed up for collection: ${collection}`,
          queryCount: queries.length
        });
        break;

      default:
        this.sendError(res, 400, `Unknown cache post action: ${action}`);
    }
  }

  private parseBody(req: http.IncomingMessage): Promise<any> {
    return new Promise((resolve, reject) => {
      let body = '';
      
      req.on('data', chunk => {
        body += chunk.toString();
      });

      req.on('end', () => {
        try {
          if (body) {
            resolve(JSON.parse(body));
          } else {
            resolve({});
          }
        } catch (error) {
          reject(new Error('Invalid JSON body'));
        }
      });

      req.on('error', reject);
    });
  }
}