import { Filter, ObjectId } from 'mongodb';

export class QueryHelper {
  // Convert string IDs to ObjectIds
  static normalizeIds(filter: Filter<any>): Filter<any> {
    const normalized = { ...filter };

    // Handle _id field
    if (normalized._id && typeof normalized._id === 'string' && ObjectId.isValid(normalized._id)) {
      normalized._id = new ObjectId(normalized._id);
    }

    // Handle nested objects
    for (const [key, value] of Object.entries(normalized)) {
      if (key.endsWith('Id') && typeof value === 'string' && ObjectId.isValid(value)) {
        normalized[key] = new ObjectId(value);
      }

      if (typeof value === 'object' && value !== null) {
        if (Array.isArray(value)) {
          // Handle arrays (e.g., $in operators)
          normalized[key] = value.map(item => 
            typeof item === 'string' && ObjectId.isValid(item) ? new ObjectId(item) : item
          );
        } else {
          // Handle nested objects recursively
          normalized[key] = this.normalizeIds(value);
        }
      }
    }

    return normalized;
  }

  // Parse string sort to object
  static parseSort(sort: string | Record<string, 1 | -1>): Record<string, 1 | -1> {
    if (typeof sort === 'object') {
      return sort;
    }

    const sortObj: Record<string, 1 | -1> = {};
    const parts = sort.split(',');

    for (const part of parts) {
      const trimmed = part.trim();
      if (trimmed.startsWith('-')) {
        sortObj[trimmed.substring(1)] = -1;
      } else {
        sortObj[trimmed] = 1;
      }
    }

    return sortObj;
  }

  // Build text search query
  static buildTextSearch(searchTerm: string, fields: string[]): Record<string, any> {
    if (!searchTerm || fields.length === 0) {
      return {};
    }

    const searchRegex = {
      $regex: searchTerm,
      $options: 'i'
    };

    if (fields.length === 1) {
      return { [fields[0]]: searchRegex };
    }

    return {
      $or: fields.map(field => ({
        [field]: searchRegex
      }))
    };
  }
}

