// types/api.types.ts
import { IncomingMessage } from "http";
import { MongoQuery } from "../.."; 

export interface ParsedUrl {
  pathname: string;
  query: Record<string, any>;
  pathSegments: string[];
}

export interface ApiResponse<T = any> {
  data?: T;
  totalRecord?: number;
  totalPage?: number;
  limit?: number;
  currentPage?: number;
  error?: string;
  details?: string;
}

export interface ExtendedRequest extends IncomingMessage {
  mongoQuery?: MongoQuery;
  body?: any;
}