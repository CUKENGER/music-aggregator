import { Inject, Injectable, Logger } from '@nestjs/common';
import { Soundcloud } from 'soundcloud.ts';
import { IMusicProvider, TrackMeta } from '../types';
import { REDIS_CLIENT } from 'libs/common/consts';
import { PrismaService } from 'libs/prisma/prisma.service';
import Redis from 'ioredis';

@Injectable()
export class SoundCloudProvider implements IMusicProvider {
  private readonly logger = new Logger(SoundCloudProvider.name);
  source = 'soundcloud';
  private sc = new Soundcloud();

  constructor(
    @Inject(REDIS_CLIENT) private redis: Redis,
    private readonly prisma: PrismaService,
  ) {
    // Можно задать токен, если есть:
    // scdl.setClientID(process.env.SOUNDCLOUD_CLIENT_ID);
  }

  async search(query: string, limit = 10): Promise<TrackMeta[]> {
    const cacheKey = `sc_search:${query}:${limit}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) return JSON.parse(cached) as TrackMeta[];

    const res = await this.sc.tracks.search({
      q: query,
      limit,
    });

    const result = res.collection.map((track) => this.mapTrack(track));

    // кешируем на 1 час
    await this.redis.set(cacheKey, JSON.stringify(result), 'EX', 3600);
    return result;
  }

  async getTrack(id: string): Promise<TrackMeta> {
    const track = await this.sc.tracks.get(id);

    return {
      id: track.id.toString(),
      title: track.title,
      artist: track.user?.username ?? 'Unknown',
      duration: Math.floor(track.duration / 1000),
      source: 'soundcloud',
    };
  }

  async getStream(id: string): Promise<NodeJS.ReadableStream> {
    const stream = await this.sc.util.streamTrack(id);

    return stream;
  }

  private mapTrack(track: any): TrackMeta {
    return {
      id: track.id.toString(),

      title: track.title,

      artist: track.publisher_metadata?.artist ?? track.user?.username,

      album: track.publisher_metadata?.album_title,

      duration: Math.floor((track.full_duration ?? track.duration) / 1000),

      source: 'soundcloud',
    };
  }
}
