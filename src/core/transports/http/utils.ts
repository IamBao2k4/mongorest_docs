// utils/http.utils.ts
import { IncomingMessage, ServerResponse } from "http";
import { parse as parseUrl } from "url";
import { ParsedUrl, ApiResponse } from "./api.types";

/**
 * Parse request body thành JSON
 */
export function parseRequestBody(req: IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk: Buffer) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });
    req.on("error", reject);
  });
}

/**
 * Gửi JSON response với CORS headers
 */
export function sendJsonResponse<T>(
  res: ServerResponse,
  statusCode: number,
  data: T
): void {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  res.writeHead(statusCode, headers);
  res.end(JSON.stringify(data));
}

/**
 * Gửi error response
 */
export function sendErrorResponse(
  res: ServerResponse,
  statusCode: number,
  error: string,
  details?: string
): void {
  const errorResponse: ApiResponse = { error, details };
  sendJsonResponse(res, statusCode, errorResponse);
}

/**
 * Parse URL và query parameters
 */
export function parseUrlHelper(req: IncomingMessage): ParsedUrl {
  const parsedUrl = parseUrl(req.url || "", true);
  const pathSegments = (parsedUrl.pathname || "")
    .split("/")
    .filter((segment) => segment);
  
  return {
    pathname: parsedUrl.pathname || "",
    query: parsedUrl.query || {},
    pathSegments,
  };
}

/**
 * Handle CORS preflight requests
 */
export function handleCorsPreflightRequest(res: ServerResponse): void {
  res.writeHead(200, {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  });
  res.end();
}

/**
 * Add response time tracking
 */
export function addResponseTimeTracking(res: ServerResponse, startTime: bigint): void {
  const originalWriteHead = res.writeHead;
  res.writeHead = function (statusCode: number, headers?: any) {
    const end = process.hrtime.bigint();
    const durationMs = Number(end - startTime) / 1_000_000;

    // Merge response time header với existing headers
    const finalHeaders = {
      ...headers,
      "X-Response-Time": `${durationMs.toFixed(2)}ms`,
    };

    return originalWriteHead.call(this, statusCode, finalHeaders);
  };
}