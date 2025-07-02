import { FastifyInstance } from "fastify";
import { commonService } from "./common.service";

export async function CommonRoutes(app: FastifyInstance) {
  // Get entity list
  app.get("/:entityName", async (request, reply) => {
    const { entityName } = request.params as { entityName: string };
    const queryData = request.query as any;
    const roles = ["user"];
    const result = await commonService.findAllQuery(
      entityName,
      queryData,
      roles
    );
    reply.send(
      result
    );
  });

  // Get entity details by id
  app.get("/:entityName/:id", async (request, reply) => {
    const { entityName, id } = request.params as {
      entityName: string;
      id: string;
    };
    return await commonService.findOne(entityName, id, ["user"], "mongodb");
  });

  // Create new entity
  app.post("/:entityName", async (request, reply) => {
    const { entityName } = request.params as { entityName: string };
    const body = request.body;
    return await commonService.create(entityName, body);
  });

  // Update entity
  app.put("/:entityName/:id", async (request, reply) => {
    const { entityName, id } = request.params as {
      entityName: string;
      id: string;
    };
    const body = request.body;
    return await commonService.update(entityName, id, body, ["user"], "mongodb");
  });

  // Delete entity
  app.delete("/:entityName/:id", async (request, reply) => {
    const { entityName, id } = request.params as {
      entityName: string;
      id: string;
    };
    return await commonService.hardDelete(entityName, id, ["user"], "mongodb");
  });

}
