import { FastifyInstance } from 'fastify';
import { EntityRoutes } from './entity';
import { CommonRoutes } from './common';
import { RbacRoutes } from './rbac';
import { AuthRoutes } from './auth';

export async function IndexRoute(app: FastifyInstance) {
  await EntityRoutes(app);
  await CommonRoutes(app);
  await RbacRoutes(app);
  await AuthRoutes(app);
}