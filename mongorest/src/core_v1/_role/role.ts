import { FastifyInstance, FastifyRequest } from 'fastify';
import { roleService } from './role.service';

export async function UserRoutes (app: FastifyInstance) {

    app.get('/api/v1/role', async (request, reply) => {
        const queryData = request.query as any;
        const roles = ["user"];
        const result = await roleService.findAllQuery(
            queryData,
            roles
        );
        reply.send(
            result
        );
    });

    app.get('/api/v1/role/:id', async (request, reply) => {
        const { id } = request.params as {
            id: string;
        };
        return await roleService.findOne(id, ["user"], "mongodb");
    });

    app.post('/api/v1/role', async (request, reply) => {
        const body = request.body;
        return await roleService.create(body);
    });

    app.put('/api/v1/role/:id', async (request, reply) => {
        const { id } = request.params as {
            id: string;
        };
        const body = request.body;
        return await roleService.update(id, body, ["user"], "mongodb");
    });

    app.delete('/api/v1/role/:collection', async (request, reply) => {
        const { id } = request.params as {
            id: string;
        };
        // TODO: Delete entity from DB
        return await roleService.hardDelete(id, ["user"], "mongodb");
    });

}