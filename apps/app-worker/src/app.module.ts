import { Module } from '@nestjs/common';
// import { BullModule } from '@nestjs/bull';

@Module({
  imports: [
    // BullModule.forRoot({
    //   redis: { host: process.env.REDIS_HOST || 'localhost', port: 6379 },
    // }),
    // BullModule.registerQueue({ name: 'search-tasks' }),
  ],
})
export class AppModule {}
