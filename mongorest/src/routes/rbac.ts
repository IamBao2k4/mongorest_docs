import { FastifyInstance, FastifyRequest } from 'fastify';
import { rbacService } from '../services/rbac/rbac';

export async function RbacRoutes(app: FastifyInstance) {

    app.get('/rbac/:collection_name', async (request, reply) => {
        const collection_name = request.params as string;
        const list = await rbacService.getByCollection(collection_name)
        return list;
    });

    app.get('/rbac', async (request, reply) => {
        const rbacJson = rbacService.getAll();
        return rbacJson;
    });

    app.post('/rbac', async (request, reply) => {
        const rbacJson = request.body;
        rbacService.updateConfig(rbacJson);
        return { message: 'RBAC configuration updated successfully' };
    });

    app.put('/rbac', async (request, reply) => {
        const rbacJson = request.body;
        rbacService.createConfig(rbacJson);
        return { message: 'RBAC configuration updated successfully' };
    });
}