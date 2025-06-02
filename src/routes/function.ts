import { FastifyInstance, FastifyRequest } from 'fastify';
import { entityService } from '../services/entity/entity.service';


export async function FunctionRoutes(app: FastifyInstance) {

  app.get('/entity', async (request, reply) => {
    const list = await entityService.getListEntity()
    return list;
  });

  app.get('/entity/:collection', async (request, reply) => {
    const { collection } = request.params as { collection: string; };
    return await entityService.getEntityByCollectionName(collection);
  });

  app.post('/entity', async (request, reply) => {
    return await entityService.createEntityFile(request.body);
  });

  app.put('/entity/:collection', async (request, reply) => {
    const { collection } = request.params as { collection: string; };
    return await entityService.updateEntityFile(collection, request.body);
  });

  app.delete('/entity/:collection', async (request, reply) => {
    const { collection } = request.params as { collection: string; };
    return await entityService.deleteEntityFile(collection);
  });

}