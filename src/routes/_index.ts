import { FastifyInstance } from 'fastify';
import { EntityRoutes } from './entity';
import { CommonRoutes } from './common';

export async function IndexRoute(app: FastifyInstance) {
  await EntityRoutes(app);
  await CommonRoutes(app);
}