import { FastifyInstance } from 'fastify';
import { EntityRoutes } from './entity';
import { CommonRoutes } from './common';
import { RbacRoutes } from './rbac';

export async function IndexRoute(app: FastifyInstance) {
  await EntityRoutes(app);
  await CommonRoutes(app);
  await RbacRoutes(app);
}