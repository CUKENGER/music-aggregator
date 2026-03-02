import { Inject, Injectable, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import { PrismaService } from 'libs/prisma/prisma.service';
import { REDIS_CLIENT } from 'libs/common/consts';
import { IMusicProvider, DeezerTrackMeta, TrackMeta } from '../types';

@Injectable()
export class DeezerProvider implements IMusicProvider {
  private readonly logger = new Logger(DeezerProvider.name);
  source = 'deezer';
  constructor(
    @Inject(REDIS_CLIENT) private redis: Redis,
    private readonly prisma: PrismaService,
  ) {}

  async search(query: string, limit = 5): Promise<DeezerTrackMeta[]> {
    const cacheKey = `deezer:search:${query}:${limit}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) return JSON.parse(cached);
    try {
      const res = await fetch(
        `https://api.deezer.com/search?q=${encodeURIComponent(query)}&limit=${limit}`,
      );
      const data = await res.json();

      if (!data.data || !data.data.length) return [];

      const tracks: DeezerTrackMeta[] = data.data.map((t: any) => ({
        id: t.id.toString(),
        title: t.title,
        artist: t.artist,
        album: t.album,
        duration: t.duration,
        source: this.source,
        preview: t.preview,
        link: t.link,
        cover: t.album?.cover_medium,
        rank: t.rank,
        explicit: t.explicit_lyrics,
        title_short: t.title_short,
        title_version: t.title_version,
        explicit_lyrics: t.explicit_lyrics,
        explicit_content_lyrics: t.explicit_content_lyrics,
        explicit_content_cover: t.explicit_content_cover,
        md5_image: t.md5_image,
        type: t.type,
      }));

      for (const t of tracks) {
        const artist = t.artist
          ? await this.prisma.artist.upsert({
              where: { deezerId: t.artist.id.toString() },
              update: { name: t.artist.name },
              create: {
                deezerId: t.artist.id.toString(),
                name: t.artist.name,
              },
            })
          : null;

        const album = t.album
          ? await this.prisma.album.upsert({
              where: { deezerId: t.album.id.toString() },
              update: { title: t.album.title, cover: t.album.cover },
              create: {
                deezerId: t.album.id.toString(),
                title: t.album.title,
                cover: t.album.cover,
              },
            })
          : null;

        await this.prisma.track.upsert({
          where: { deezerId: t.id },
          update: {},
          create: {
            deezerId: t.id,
            title: t.title,
            duration: t.duration ?? 0,
            source: t.source,
            preview: t.preview,
            link: t.link,
            rank: t.rank,
            explicit: t.explicit,
            title_short: t.title_short,
            title_version: t.title_version,
            explicit_lyrics: t.explicit_lyrics,
            explicit_content_lyrics: t.explicit_content_lyrics,
            explicit_content_cover: t.explicit_content_cover,
            md5_image: t.md5_image,
            type: t.type,
            artistId: artist?.id,
            albumId: album?.id,
          },
        });
      }

      await this.redis.set(cacheKey, JSON.stringify(tracks), 'EX', 60 * 60); // кэш 1 час
      return tracks;
    } catch (err) {
      this.logger.error(`Deezer search error: ${(err as Error).message}`);
      return [];
    }
  }

  async getTrack(id: string): Promise<TrackMeta> {
    try {
      const res = await fetch(`https://api.deezer.com/track/${id}`);
      const t = await res.json();
      return {
        id: t.id.toString(),
        title: t.title,
        artist: t.artist.name,
        album: t.album?.title,
        duration: t.duration,
        source: this.source,
      };
    } catch (err) {
      this.logger.error(`Deezer getTrack error: ${(err as Error).message}`);
      return {
        id: 'fallback',
        title: 'Track not found',
        artist: 'system',
        source: 'internal',
        duration: 0,
      };
    }
  }

  async getStream(id: string): Promise<string> {
    // Deezer не отдаёт прямой поток, поэтому просто возвращаем ссылку на трек
    return `https://www.deezer.com/track/${id}`;
  }
}
