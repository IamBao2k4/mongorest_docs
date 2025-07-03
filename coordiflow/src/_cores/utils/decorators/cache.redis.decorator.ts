import { SetMetadata, UseInterceptors } from '@nestjs/common';
import { ClearCacheInterceptor } from 'src/_cores/common/interceptors/clear-cache.interceptor';

export const CacheRedisTTL = (ttl: number) => SetMetadata('ttl', ttl);
export const CacheRedisKey = (key: string) => SetMetadata('key', key); // input is items of CACHE_KEYS


export const ClearCachePatterns = (patterns: string[]) => {
    return (target: any, key: string, descriptor: PropertyDescriptor) => {
        SetMetadata('cachePatterns', patterns)(target, key, descriptor);
        UseInterceptors(ClearCacheInterceptor)(target, key, descriptor);
    };
};
