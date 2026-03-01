import { NestFactory } from '@nestjs/core';
import { AppWorkerModule } from './app.module';
import * as dotenv from 'dotenv';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppWorkerModule);

  console.log(`\n⚡ [Worker] Server started!`);
  console.log(`🐳 Environment: ${process.env.NODE_ENV || 'development'}\n`);
}
bootstrap();
