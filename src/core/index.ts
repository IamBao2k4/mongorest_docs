export interface QueryParams {
  [key: string]: string | string[];
}

export interface MongoQuery {
  filter: Record<string, any>;
  projection?: Record<string, 1 | 0>;
  sort?: Record<string, 1 | -1>;
}

export interface ParsedFilter {
  field: string;
  operator: string;
  value: any;
  modifier?: string;
}