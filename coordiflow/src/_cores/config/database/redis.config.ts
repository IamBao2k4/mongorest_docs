import * as dotenv from 'dotenv';
import { Redis, RedisOptions } from 'ioredis';
import { appSettings } from '../appsettings';

dotenv.config();

export const REDIS_SETUP = {
  port: appSettings.redis.port,
  host: appSettings.redis.host,
  password: appSettings.redis.password,
  username: appSettings.redis.username,
  keyPrefix: `${appSettings.appName}`,
} as RedisOptions;

export const REDIS_CONNECT_COMMON = new Redis(REDIS_SETUP);
