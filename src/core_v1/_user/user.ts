import { FastifyInstance, FastifyRequest } from 'fastify';
import { userService } from './user.service';
import { roleService } from '../_role/role.service';

export async function UserRoutes(app: FastifyInstance) {

    app.get('/api/v1/user', async (request, reply) => {
        const queryData = request.query as any;
        const roles = ["user"];
        const result = await userService.findAllQuery(
            queryData,
            roles
        );

        let res: any[] = []

        for (const r of result) {
            console.log('filterPassword', filterPassword(r))
            res.push(filterPassword(r))
        }
        console.log('res', res)
        reply.send(
            res
        );
    });

    app.get('/api/v1/user/:id', async (request, reply) => {
        const { id } = request.params as {
            id: string;
        };
        const user = await userService.findOne(id, ["user"], "mongodb");
        if (!user) {
            reply.status(404).send({ error: 'User not found' });
            return;
        }
        const roles = await roleService.findAllQuery(["user"]);
        roles.map(role => {
            for (let r = 0; r < user.role.length; r++) {
                if (user.role[r] === role._id.toString()) {
                    user.role[r] = { _id: role._id, title: role.title };
                }
            }
        });
        console.log('User found:', user);
        console.log('Filtered user:', filterPassword(user));
        return filterPassword(user);
    });

    app.post('/api/v1/user', async (request, reply) => {
        const body = request.body;
        return await userService.create(body);
    });

    app.put('/api/v1/user/:id', async (request, reply) => {
        const { id } = request.params as {
            id: string;
        };
        const body = request.body;
        return await userService.update(id, body, ["user"], "mongodb");
    });

    app.delete('/api/v1/user/:collection', async (request, reply) => {
        const { id } = request.params as {
            id: string;
        };
        // TODO: Delete entity from DB
        return await userService.hardDelete(id, ["user"], "mongodb");
    });

}