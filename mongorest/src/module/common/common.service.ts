import { HttpError } from '../../utils/http-error';
import { coreGlobal } from '../../configs/core-global';
import { DatabaseType } from '../../mongorest/adapters/base/databaseAdapter';

export interface PaginatedResult<T> {
    limit: number;
    skip: number;
    documents: T[];
    count: number;
}

class CommonService {

  LIST_ENTITY_WITHOUT_TENANT = [
    'user',
    'entity',
    'role',
  ]

  constructor() { 
    console.log('CommonService Initialized');
  }

  async findAllQuery(
    collectionName: string,
    queryData: any = {},
    roles: string[] = ['default'],
  ): Promise<any[]> {
    const result = coreGlobal.findAll(queryData as any, collectionName, roles, 'mongodb');
    return result;
  }
  async findOne(collectionName: string, id: string, roles: string[] = ['default'], dbType: DatabaseType = 'mongodb'): Promise<any> {
    return await coreGlobal.findById(
      collectionName,
      id,
      roles,
      dbType,
    )
  }

  async create(collectionName: string, createDto: any, roles: string[] = ['default'], dbType: DatabaseType = 'mongodb'): Promise<any> {
    return await coreGlobal.create(
      collectionName,
      createDto,
      roles,
      dbType
    );
  }

  async update(collectionName: string, id: string, body: any, roles: string[] = ['default'], dbType: DatabaseType = 'mongodb', _session?: any): Promise<any> {
    return await coreGlobal.update(
      collectionName,
      id,
      body,
      roles,
      dbType,
      _session
    );
  }

  async hardDelete(collectionName: string, id: string, roles: string[] = ['default'], dbType: DatabaseType = 'mongodb'): Promise<any> {
    return await coreGlobal.delete(
      collectionName,
      id,
      roles,
      dbType
    );
  }

}

export const commonService = new CommonService();
