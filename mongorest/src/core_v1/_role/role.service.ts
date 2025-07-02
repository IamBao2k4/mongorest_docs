import { HttpError } from '../../utils/http-error';
import { mongoDBService } from '../../common/bases/mongodb.base';
import { coreGlobal } from '../../configs/core-global';
import { DatabaseType } from '../../mongorest_core/adapters/base/databaseAdapter';

export interface PaginatedResult<T> {
    limit: number;
    skip: number;
    documents: T[];
    count: number;
}

class RoleService {

  LIST_ENTITY_WITHOUT_TENANT = [
    'user',
    'entity',
    'role',
  ]

  constructor() { 
    console.log('CommonService Initialized');
  }

  protected async buildCollectionConnect(collection_name: string) {
    let entityCollection = await mongoDBService.getCollection('entity');
    let entity = await entityCollection.findOne({ mongodb_collection_name: collection_name });
    if (!entity) throw new HttpError('Collection not found', 404);
    return await mongoDBService.getCollection(collection_name);
  }

  async findAllQuery(
    queryData: any = {},
    roles: string[] = ['default'],
    dbType: DatabaseType = 'mongodb',
  ): Promise<any[]> {
    const result = coreGlobal.findAll(queryData as any, 'role', roles, dbType);
    return result;
  }
  async findOne(
    id: string, 
    roles: string[] = ['default'], 
    dbType: DatabaseType = 'mongodb'
): Promise<any> {
    return await coreGlobal.findById(
      'role',
      id,
      roles,
      dbType,
    )
  }

  async create(
    createDto: any, 
    roles: string[] = ['default'], 
    dbType: DatabaseType = 'mongodb'
): Promise<any> {
    return await coreGlobal.create(
      'role',
      createDto,
      roles,
      dbType
    );
  }

  async update(
    id: string, 
    body: any, 
    roles: string[] = ['default'], 
    dbType: DatabaseType = 'mongodb', 
    _session?: any
): Promise<any> {
    return await coreGlobal.update(
      'role',
      id,
      body,
      roles,
      dbType,
      _session
    );
  }

  async hardDelete(
    id: string, 
    roles: string[] = ['default'], 
    dbType: DatabaseType = 'mongodb'
): Promise<any> {
    return await coreGlobal.delete(
      'role',
      id,
      roles,
      dbType
    );
  }

}

export const roleService = new RoleService();
