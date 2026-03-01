import { NestFactory } from '@nestjs/core';
import { AppApiModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppApiModule);
  app.enableCors();
  await app.listen(3000);
}
bootstrap();
