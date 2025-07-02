import { Module } from '@nestjs/common';
import { MONGO_CONFIG } from './_cores/config/database/mongo.config';
import { MongooseModule } from '@nestjs/mongoose';
import { REDIS_SETUP } from './_cores/config/database/redis.config';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';

@Module({
  imports: [
    MongooseModule.forRoot(`${MONGO_CONFIG.url}/${MONGO_CONFIG.dbName}?${MONGO_CONFIG.optionMongo}`),
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => ({
        store: await redisStore({
          socket: {
            host: REDIS_SETUP.host,
            port: REDIS_SETUP.port,
          },
          password: REDIS_SETUP.password,
        }),
      }),
    }),
  ],
})
export class AppModule {}
