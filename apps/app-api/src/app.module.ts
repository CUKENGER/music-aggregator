import { Module } from '@nestjs/common';
import { ProvidersModule } from './providers/providers.module';
import { RedisModule } from 'libs/redis/redis.module';
import { PrismaModule } from 'libs/prisma/prisma.module';

@Module({
  imports: [ProvidersModule, RedisModule, PrismaModule],
})
export class AppApiModule {}
