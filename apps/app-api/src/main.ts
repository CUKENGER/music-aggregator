import { NestFactory } from '@nestjs/core';
import { AppApiModule } from './app.module';
import * as dotenv from 'dotenv';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppApiModule);
  app.enableCors();

  const port = process.env.API_PORT ? parseInt(process.env.API_PORT, 10) : 3000;

  await app.listen(port);

  console.log(`\n🚀 [API] Server is running!`);
  console.log(`🌐 URL: http://localhost:${port}`);
  console.log(`🐳 Environment: ${process.env.NODE_ENV || 'development'}\n`);
}
bootstrap();
