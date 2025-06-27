import { FastifyInstance, FastifyRequest } from 'fastify';
import { tenantService } from '../services/tenant/tenant';

export async function TenantRoutes(app: FastifyInstance) {

  app.get('/tenant/:tenant_id', async (request, reply) => {
    const { tenant_id } = request.params as { tenant_id: string; };
    const list = await tenantService.getTenantById(tenant_id);
    return list;
  });
}