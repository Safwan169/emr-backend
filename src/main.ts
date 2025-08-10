import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { Server } from 'http';

let cachedServer: Server;

export default async function handler(req: any, res: any) {
  if (!cachedServer) {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);

    app.use(cookieParser());

    app.useStaticAssets(join(process.cwd(), 'uploads'), {
      prefix: '/uploads/',
    });

    app.enableCors({
      origin: 'http://localhost:3000',
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      credentials: true,
    });

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();

    cachedServer = app.getHttpAdapter().getInstance();
  }

  return cachedServer(req, res);
}
