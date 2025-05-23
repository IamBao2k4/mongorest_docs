import { FastifyInstance, FastifyRequest } from 'fastify';
import { CommonService } from '../services/common/common.service';

const commonService = new CommonService();

export async function CommonRoutes(app: FastifyInstance) {
  // Lấy danh sách entity
  app.get('/common/:entityName', async (request, reply) => {
    const { entityName } = request.params as { entityName: string };
    // TODO: Lấy danh sách entity từ DB
    return { entity: entityName, action: 'list' };
  });

  // Lấy chi tiết entity theo id
  app.get('/common/:entityName/:id', async (request, reply) => {
    const { entityName, id } = request.params as { entityName: string; id: string };
    // TODO: Lấy chi tiết entity từ DB
    return { entity: entityName, id, action: 'detail' };
  });

  // Tạo mới entity
  app.post('/common/:entityName', async (request, reply) => {
    const { entityName } = request.params as { entityName: string };
    const body = request.body;
    // TODO: Tạo mới entity trong DB
    return { entity: entityName, data: body, action: 'create' };
  });

  // Cập nhật entity
  app.put('/common/:entityName/:id', async (request, reply) => {
    const { entityName, id } = request.params as { entityName: string; id: string };
    const body = request.body;
    // TODO: Cập nhật entity trong DB
    return { entity: entityName, id, data: body, action: 'update' };
  });

  // Xóa entity
  app.delete('/common/:entityName/:id', async (request, reply) => {
    const { entityName, id } = request.params as { entityName: string; id: string };
    // TODO: Xóa entity trong DB
    return { entity: entityName, id, action: 'delete' };
  });
}