import {
  Injectable,
  OnApplicationShutdown,
  OnModuleInit,
} from '@nestjs/common';
import { FlowProducer, JobsOptions, Queue, QueueEvents } from 'bullmq';
import { InjectFlowProducer, InjectQueue } from '@nestjs/bullmq';

@Injectable()
export class QueueService implements OnModuleInit, OnApplicationShutdown {
  private queueEventsMap: Map<string, QueueEvents> = new Map();

  constructor(
    private readonly subscribesQueue: Queue,
    @InjectFlowProducer('FLOW') readonly flowProducer: FlowProducer,
  ) {}

  async onModuleInit() {
    // инициализация очередей
  }

  async onApplicationShutdown(signal?: string) {
    // закрываем все события очередей
    for (const queueEvents of this.queueEventsMap.values()) {
      await queueEvents.close();
    }
    console.log(`[QueueService] Shutdown signal received: ${signal}`);
  }
}
