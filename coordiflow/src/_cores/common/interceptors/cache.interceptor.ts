import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Inject, HttpException } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Reflector } from '@nestjs/core';
import { appSettings } from 'src/_cores/config/appsettings';
import { isMongoId } from 'class-validator';
import * as zlib from 'zlib';
import { promisify } from 'util';

const gzip = promisify(zlib.gzip);
const gunzip = promisify(zlib.gunzip);

class CacheRespose {
    type: string;
    data: any;
}
@Injectable()
export class CacheInterceptor implements NestInterceptor {
    
    constructor(
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
        private reflector: Reflector,
    ) { }

    async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
        const ttl = this.reflector.get<number>('ttl', context.getHandler()) || 60 * 60; // default TTL is 1 hour
        const key = this.getCacheKeyDefault(context, this.reflector.get<string>('key', context.getHandler()));
        const cachedResponse = await this.cacheManager.get(`${appSettings.appName}:caches:${key}`) as CacheRespose;
        if (cachedResponse) {
            const decompressedResponse = await gunzip(Buffer.from(cachedResponse.data, 'base64'));
            return of(JSON.parse(decompressedResponse.toString()));
        }
        return next.handle().pipe(
            tap(async response => {
                if (response) {
                    const compressedResponse = await gzip(JSON.stringify(response));
                    await this.cacheManager.set(`${appSettings.appName}:caches:${key}`, compressedResponse, ttl * 1000); // cache with specified TTL
                    // this.cacheManager.set(`${appSettings.appName}:caches:${key}`, response, ttl * 1000); // cache with specified TTL
                } else {
                    const compressedResponse = await gzip(JSON.stringify({ message: 'Data not found - caching' }));
                    await this.cacheManager.set(`${appSettings.appName}:caches:${key}`, compressedResponse, ttl * 1000); // cache with specified TTL
                    // this.cacheManager.set(`${appSettings.appName}:caches:${key}`, { message: 'Data not found - caching' }, ttl * 1000); // cache with specified TTL
                }
            })
        );
    }

    private getCacheKeyDefault(context: ExecutionContext, key_custom?: string): string {

        const request = context.switchToHttp().getRequest();

        let user_id = request?.headers?.user?.id;
        let tenant_id = request?.headers['x-tenant-id'];

        if (user_id && !isMongoId(user_id)) throw new HttpException('User ID is not valid to cache', 400);
        if (tenant_id && !isMongoId(tenant_id)) throw new HttpException('Tenant ID is not valid to cache', 400);

        let key = `${request.method}@${request.url.replace(/:/g, '@')}`;

        if (key_custom) key = `${key_custom}:${key}`;
        if (user_id) key = `${user_id}:${key}`;
        if (tenant_id) key = `${tenant_id}:${key}`;

        return key;

    }

}
