import { FastifyInstance, FastifyRequest } from "fastify";
import { commonService } from "../services/common/common.service";
import { queryBuilderMiddleware } from "../common/middlewares/query-builder.middleware";
import { coreGlobal } from "../configs/core-global";

export async function CommonRoutes(app: FastifyInstance) {
  // Get entity list
  app.get("/api/v1/:entityName", async (request, reply) => {
    const { entityName } = request.params as { entityName: string };
    const queryData = request.query as any;
    console.log(`Fetching list for entity: ${entityName}`, queryData);
    const roles = ["user"];
    const result = await commonService.findAllQuery(
      entityName,
      queryData,
      roles
    );
    reply.send({
      success: true,
      ...result,
      timestamp: new Date().toISOString(),
    });
  });

  // Get entity details by id
  app.get("/api/v1/:entityName/:id", async (request, reply) => {
    const { entityName, id } = request.params as {
      entityName: string;
      id: string;
    };
    return await commonService.findOne(entityName, id, ["user"], "mongodb");
  });

  // Create new entity
  app.post("/common/:entityName", async (request, reply) => {
    const { entityName } = request.params as { entityName: string };
    const body = request.body;
    return await commonService.create(entityName, body);
  });

  // Update entity
  app.put("/common/:entityName/:id", async (request, reply) => {
    const { entityName, id } = request.params as {
      entityName: string;
      id: string;
    };
    const body = request.body;
    return await commonService.update(entityName, id, body, ["user"], "mongodb");
  });

  // Delete entity
  app.delete("/common/:entityName/:id", async (request, reply) => {
    const { entityName, id } = request.params as {
      entityName: string;
      id: string;
    };
    // TODO: Delete entity from DB
    return await commonService.hardDelete(entityName, id, ["user"], "mongodb");
  });

}
