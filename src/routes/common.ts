import { FastifyInstance, FastifyRequest } from 'fastify';
import { commonService } from '../services/common/common.service';
import { queryBuilderMiddleware } from '../common/middlewares/query-builder.middleware';

export async function CommonRoutes(app: FastifyInstance) {
  // Get entity list
  app.get('/common/:entityName', {
    preHandler: queryBuilderMiddleware
  }, async (request, reply) => {
    const { entityName } = request.params as { entityName: string };
    const { queryData, pagination } = request;

    return await commonService.findAllQuery(
      entityName,
      queryData,
    );
  });

  // Get entity details by id
  app.get('/common/:entityName/:id', async (request, reply) => {
    const { entityName, id } = request.params as { entityName: string; id: string };
    // TODO: Get entity details from DB
    return { entity: entityName, id, action: 'detail' };
  });

  // Create new entity
  app.post('/common/:entityName', async (request, reply) => {
    const { entityName } = request.params as { entityName: string };
    const body = request.body;
    // TODO: Create new entity in DB
    return { entity: entityName, data: body, action: 'create' };
  });

  // Update entity
  app.put('/common/:entityName/:id', async (request, reply) => {
    const { entityName, id } = request.params as { entityName: string; id: string };
    const body = request.body;
    // TODO: Update entity in DB
    return { entity: entityName, id, data: body, action: 'update' };
  });

  // Delete entity
  app.delete('/common/:entityName/:id', async (request, reply) => {
    const { entityName, id } = request.params as { entityName: string; id: string };
    // TODO: Delete entity from DB
    return { entity: entityName, id, action: 'delete' };
  });
}