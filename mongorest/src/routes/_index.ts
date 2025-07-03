import { FastifyInstance } from 'fastify';
import { EntityRoutes } from '../module/_entity/entity';
import { CommonRoutes } from '../module/common/common';

export async function IndexRoute(app: FastifyInstance) {
  await EntityRoutes(app);
  await CommonRoutes(app);
}