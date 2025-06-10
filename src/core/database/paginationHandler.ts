import { Filter } from 'mongodb';
import { BaseDocument, PaginationResult } from './types';
import { CrudOperations } from './crudOperations';


export class PaginationHandler<T extends BaseDocument = BaseDocument> {
  constructor(private crudOps: CrudOperations<T>) {}

  async paginate(
    filter: Filter<T> = {},
    options: {
      page?: number;
      limit?: number;
    } = {}
  ): Promise<PaginationResult<T>> {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const skip = (page - 1) * limit;

    const [data, totalDocs] = await Promise.all([
      this.crudOps.find(filter, { limit, skip }),
      this.crudOps.count(filter)
    ]);

    const totalPages = Math.ceil(totalDocs / limit);

    return {
      data,
      pagination: {
        currentPage: page,
        totalPages,
        totalDocs,
        limit,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    };
  }
}