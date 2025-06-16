// src/adapters/redis/RedisAdapter.ts

import { createClient, RedisClientType } from "redis";

export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  database?: number;
  keyPrefix?: string;
  ttl?: number; // Time to live in seconds
}

export interface CacheOptions {
  ttl?: number;
  skipCache?: boolean;
}

export class RedisAdapter {
  private client: RedisClientType | null = null;
  private config: RedisConfig;
  private isConnectionActive: boolean = false;

  constructor(config: RedisConfig) {
    this.config = {
      ttl: 300, // Default 5 minutes
      keyPrefix: "mongorest:",
      ...config,
    };
  }

  async connect(): Promise<void> {
    try {
      this.client = createClient({
        socket: {
          host: this.config.host,
          port: this.config.port,
        },
        password: this.config.password,
        database: this.config.database || 0,
      });

      this.client.on("error", (err: any) => {
        console.error("Redis Client Error:", err);
        this.isConnectionActive = false;
      });

      this.client.on("connect", () => {
        console.log("Connected to Redis");
        this.isConnectionActive = true;
      });

      this.client.on("disconnect", () => {
        console.log("Disconnected from Redis");
        this.isConnectionActive = false;
      });

      await this.client.connect();
      console.log("Redis adapter initialized successfully");
    } catch (error) {
      console.error("Redis connection error:", error);
      this.isConnectionActive = false;
      // Don't throw error - allow app to continue without cache
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.quit();
      this.client = null;
      this.isConnectionActive = false;
      console.log("Redis client disconnected");
    }
  }

  isConnected(): boolean {
    return this.isConnectionActive && this.client !== null;
  }

  private generateKey(collection: string, queryHash: string): string {
    return `${this.config.keyPrefix}${collection}:${queryHash}`;
  }

  private hashQuery(query: any): string {
    // Hàm hash cải tiến để hash toàn bộ query object

    // 1. Chuẩn hóa query object trước khi hash
    const normalizedQuery = this.normalizeQuery(query);

    // 2. Tạo chuỗi deterministic từ query
    const queryString = this.stringifyQuery(normalizedQuery);

    // 3. Hash bằng djb2 algorithm cải tiến
    let hash = 5381; // djb2 initial value

    for (let i = 0; i < queryString.length; i++) {
      const char = queryString.charCodeAt(i);
      hash = (hash << 5) + hash + char; // hash * 33 + char
      hash = hash >>> 0; // Convert to unsigned 32-bit integer
    }

    // 4. Trả về hash dạng base36 để ngắn gọn
    return hash.toString(36);
  }

  private normalizeQuery(query: any): any {
    if (query === null || query === undefined) {
      return null;
    }

    if (Array.isArray(query)) {
      // Sắp xếp array nếu có thể để đảm bảo tính nhất quán
      return query
        .map((item) => this.normalizeQuery(item))
        .sort((a, b) => {
          const aStr = JSON.stringify(a);
          const bStr = JSON.stringify(b);
          return aStr.localeCompare(bStr);
        });
    }

    if (typeof query === "object") {
      const normalized: any = {};

      // Sắp xếp keys và normalize values
      Object.keys(query)
        .sort()
        .forEach((key) => {
          normalized[key] = this.normalizeQuery(query[key]);
        });

      return normalized;
    }

    // Primitive values
    return query;
  }

  private stringifyQuery(query: any): string {
    try {
      // Sử dụng JSON.stringify với replacer function để đảm bảo tính nhất quán
      return JSON.stringify(query, (key, value) => {
        // Xử lý các trường hợp đặc biệt
        if (value instanceof Date) {
          return { __date: value.toISOString() };
        }
        if (value instanceof RegExp) {
          return { __regex: value.toString() };
        }
        if (typeof value === "function") {
          return { __function: value.toString() };
        }
        if (value === undefined) {
          return { __undefined: true };
        }
        return value;
      });
    } catch (error) {
      // Fallback nếu JSON.stringify fail
      console.warn("Failed to stringify query, using fallback:", error);
      return String(query);
    }
  }

  // Alternative: Sử dụng crypto hash nếu muốn hash mạnh hơn
  private hashQueryWithCrypto(query: any): string {
    const crypto = require("crypto");
    const normalizedQuery = this.normalizeQuery(query);
    const queryString = this.stringifyQuery(normalizedQuery);

    return crypto
      .createHash("sha256")
      .update(queryString, "utf8")
      .digest("hex")
      .substring(0, 16); // Lấy 16 ký tự đầu để ngắn gọn
  }

  // Alternative: Hash với FNV-1a algorithm (nhanh hơn)
  private hashQueryFNV1a(query: any): string {
    const normalizedQuery = this.normalizeQuery(query);
    const queryString = this.stringifyQuery(normalizedQuery);

    let hash = 2166136261; // FNV offset basis

    for (let i = 0; i < queryString.length; i++) {
      hash ^= queryString.charCodeAt(i);
      hash *= 16777619; // FNV prime
      hash = hash >>> 0; // Convert to unsigned 32-bit
    }

    return hash.toString(36);
  }

  // Alternative: Hash với xxHash-like algorithm (rất nhanh)
  private hashQueryXX(query: any): string {
    const normalizedQuery = this.normalizeQuery(query);
    const queryString = this.stringifyQuery(normalizedQuery);

    const PRIME1 = 2654435761;
    const PRIME2 = 2246822519;
    const PRIME3 = 3266489917;
    const PRIME4 = 668265263;
    const PRIME5 = 374761393;

    let h32 = PRIME5;
    let i = 0;

    while (i <= queryString.length - 4) {
      const k1 =
        (queryString.charCodeAt(i) +
          (queryString.charCodeAt(i + 1) << 8) +
          (queryString.charCodeAt(i + 2) << 16) +
          (queryString.charCodeAt(i + 3) << 24)) >>>
        0;

      h32 = (h32 + k1 * PRIME3) >>> 0;
      h32 = ((h32 << 17) | (h32 >>> 15)) >>> 0;
      h32 = (h32 * PRIME4) >>> 0;
      i += 4;
    }

    while (i < queryString.length) {
      const k1 = queryString.charCodeAt(i) >>> 0;
      h32 = (h32 + k1 * PRIME5) >>> 0;
      h32 = ((h32 << 11) | (h32 >>> 21)) >>> 0;
      h32 = (h32 * PRIME1) >>> 0;
      i++;
    }

    h32 ^= h32 >>> 15;
    h32 = (h32 * PRIME2) >>> 0;
    h32 ^= h32 >>> 13;
    h32 = (h32 * PRIME3) >>> 0;
    h32 ^= h32 >>> 16;

    return h32.toString(36);
  }

  async get<T = any>(collection: string, query: any): Promise<T | null> {
    if (!this.isConnected()) {
      return null;
    }

    try {
      const queryHash = this.hashQuery(query);
      const key = this.generateKey(collection, queryHash);

      const cached = await this.client!.get(key);
      if (cached) {
        console.log(`Cache hit for ${collection}:${queryHash}`);
        return JSON.parse(cached);
      }

      console.log(`Cache miss for ${collection}:${queryHash}`);
      return null;
    } catch (error) {
      console.error("Redis get error:", error);
      return null;
    }
  }

  async set(
    collection: string,
    query: any,
    data: any,
    options?: CacheOptions
  ): Promise<void> {
    if (!this.isConnected() || options?.skipCache) {
      return;
    }
    console.log("query", JSON.stringify(query));
    try {
      const queryHash = this.hashQuery(query);
      const key = this.generateKey(collection, queryHash);
      const ttl = options?.ttl || this.config.ttl!;

      await this.client!.setEx(key, ttl, JSON.stringify(data));
      console.log(
        `Cached result for ${collection}:${queryHash} with TTL ${ttl}s`
      );
    } catch (error) {
      console.error("Redis set error:", error);
    }
  }

  async del(collection: string, query?: any): Promise<void> {
    if (!this.isConnected()) {
      return;
    }

    try {
      if (query) {
        // Delete specific query cache
        const queryHash = this.hashQuery(query);
        const key = this.generateKey(collection, queryHash);
        await this.client!.del(key);
        console.log(`Deleted cache for ${collection}:${queryHash}`);
      } else {
        // Delete all cache for collection
        const pattern = this.generateKey(collection, "*");
        const keys = await this.client!.keys(pattern);
        if (keys.length > 0) {
          await this.client!.del(keys);
          console.log(
            `Deleted ${keys.length} cache entries for collection ${collection}`
          );
        }
      }
    } catch (error) {
      console.error("Redis delete error:", error);
    }
  }

  async invalidateCollection(collection: string): Promise<void> {
    await this.del(collection);
  }

  async flush(): Promise<void> {
    if (!this.isConnected()) {
      return;
    }

    try {
      const pattern = `${this.config.keyPrefix}*`;
      const keys = await this.client!.keys(pattern);
      if (keys.length > 0) {
        await this.client!.del(keys);
        console.log(`Flushed ${keys.length} cache entries`);
      }
    } catch (error) {
      console.error("Redis flush error:", error);
    }
  }

  async getStats(): Promise<any> {
    if (!this.isConnected()) {
      return null;
    }

    try {
      const info = await this.client!.info("memory");
      const keyCount = await this.client!.dbSize();

      return {
        connected: this.isConnected(),
        keyCount,
        memoryInfo: info,
      };
    } catch (error) {
      console.error("Redis stats error:", error);
      return null;
    }
  }
}
