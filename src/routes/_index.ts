import { FastifyInstance } from 'fastify';
import { UserRoutes } from '../core_v1/_user/user';
import { EntityRoutes } from '../core_v1/_entity/entity';
import { CommonRoutes } from '../core_v1/common/common';
import { RbacRoutes } from './rbac';
import { AuthRoutes } from '../core_v1/_auth/auth';
// import { TenantRoutes } from './tenant';

export async function IndexRoute(app: FastifyInstance) {
  await UserRoutes(app);
  await EntityRoutes(app);
  await RbacRoutes(app);
  await AuthRoutes(app);
  await CommonRoutes(app);
  // await TenantRoutes(app);
}