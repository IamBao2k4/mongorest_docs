import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe, VersioningType } from "@nestjs/common";
import { join } from "path";
import * as compression from "compression";
import { appSettings } from "./_cores/config/appsettings";
import {
  FastifyAdapter,
  NestFastifyApplication,
} from "@nestjs/platform-fastify";
import * as multipart from "@fastify/multipart";


export async function bootstrap() {

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      logger: true,
      // bodyLimit: 2097152, // 2MB
    }),
  );

  app.use(compression())
  app.useStaticAssets({ root: join(process.cwd(), "public") }); // for fastify
  app.setGlobalPrefix(`${appSettings.prefixApi}`);
  app.enableVersioning({ type: VersioningType.URI });
  app.useGlobalPipes(new ValidationPipe({}));

  await app.register(multipart);
  // CORS settings
  await app.register(require("@fastify/cors"), {
    "origin": ["*"],
    "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    "allowedHeaders": ["*"],
    "credentials": false,
    "preflightContinue": true,
  });

  // Start server
  await app.listen(appSettings.port || 8080, "0.0.0.0"); // for fastify
  return app;
}

bootstrap();