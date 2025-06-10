import { BaseDocument } from "./types"; 

export class TimestampMiddleware {
  // Add timestamps to document before create
  static beforeCreate(data: Partial<BaseDocument>): Partial<BaseDocument> {
    const now = new Date();
    return {
      ...data,
      createdAt: now,
      updatedAt: now
    };
  }

  // Update timestamp before update
  static beforeUpdate(data: Partial<BaseDocument>): Partial<BaseDocument> {
    return {
      ...data,
      updatedAt: new Date()
    };
  }

  // Clean update data (remove createdAt if present)
  static cleanUpdateData(data: Partial<BaseDocument>): Partial<BaseDocument> {
    const cleaned = { ...data };
    delete cleaned.createdAt; // Don't allow updating createdAt
    return this.beforeUpdate(cleaned);
  }
}
