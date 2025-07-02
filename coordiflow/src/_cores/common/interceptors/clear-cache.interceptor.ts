import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Inject, HttpException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Reflector } from '@nestjs/core';
import { REDIS_CONNECT_COMMON } from 'src/_cores/config/database/redis.config';
import { Redis } from 'ioredis';
import { isMongoId } from 'class-validator';
import { ENTITY_KEY } from 'src/_cores/utils/decorators/entity-param.decorator';

@Injectable()
export class ClearCacheInterceptor implements NestInterceptor {
    private redisClient: Redis;

    constructor(
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
        private reflector: Reflector,
    ) {
        this.redisClient = REDIS_CONNECT_COMMON;
    }

    async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
        const cachePatterns = this.reflector.get<string[]>('cachePatterns', context.getHandler()) || [];
        const entityName = this.reflector.get<string>(ENTITY_KEY , context.getHandler());
        if (entityName) cachePatterns.push(entityName);
        const request = context.switchToHttp().getRequest();
        const params = Object.values(request.params);
        let tenant_id = request?.headers['x-tenant-id'];
        if (tenant_id && !isMongoId(tenant_id)) throw new HttpException('Tenant ID is not valid to cache', 400);
        let folder = ``;
        if (tenant_id) folder = `${tenant_id}:${folder}`;
        const finalPatterns = cachePatterns.concat(params.map(param => param.toString()));
        await Promise.allSettled(finalPatterns.map(pattern => this.clearCachePatternLua(folder, pattern)));
        return next.handle();
    }

    private async clearCachePatternLua(folder: string, pattern: string): Promise<void> { // nhanh hơn nhưng có thể block redis nếu có nhiều key
        const script = `
            local keys = redis.call('KEYS', ARGV[1])
            for i=1,#keys,5000 do
                redis.call('DEL', unpack(keys, i, math.min(i+4999, #keys)))
            end
            return keys
        `;
        const matchPattern = `*${folder}*${pattern}*`;
        await this.redisClient.eval(script, 0, matchPattern);
    }
    
}

