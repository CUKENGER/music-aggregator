import { Inject, Injectable, Logger } from '@nestjs/common';
import { Soundcloud } from 'soundcloud.ts';
import { Readable } from 'stream';
import { IMusicProvider, SoundcloudTrackMeta, TrackMeta } from '../types';
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

  async search(query: string, limit = 10): Promise<SoundcloudTrackMeta[]> {
    const cacheKey = `sc_search:${query}:${limit}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) return JSON.parse(cached) as TrackMeta[];

    const res = await this.sc.tracks.search({
      q: query,
      limit,
    });
    const result: SoundcloudTrackMeta[] = [];
    this.logger.log('res', res);
    for (const track of res.collection) {
      // апсертим артиста
      const artist = await this.prisma.artist.upsert({
        where: { soundcloudId: track.user?.id.toString() ?? '' },
        create: {
          soundcloudId: track.user?.id.toString(),
          name: track.user?.username ?? 'Unknown',
          avatar: track.user?.avatar_url,
          followers: track.user?.followers_count,
          verified: track.user?.verified,
        },
        update: {
          name: track.user?.username,
          avatar: track.user?.avatar_url,
          followers: track.user?.followers_count,
          verified: track.user?.verified,
        },
      });

      // апсертим трек
      const dbTrack = await this.prisma.track.upsert({
        where: { soundcloudId: track.id.toString() },
        create: {
          soundcloudId: track.id.toString(),
          title: track.title,
          duration: Math.floor(track.duration / 1000),
          source: 'soundcloud',
          cover: track.artwork_url,
          playbackCount: track.playback_count,
          likes: track.likes_count,
          comments: track.comment_count,
          reposts: track.reposts_count,
          artistId: artist.id,
          link: track.permalink_url,
          releaseDate: track.release_date
            ? new Date(track.release_date)
            : undefined,
        },
        update: {
          title: track.title,
          duration: Math.floor(track.duration / 1000),
          cover: track.artwork_url,
          playbackCount: track.playback_count,
          likes: track.likes_count,
          comments: track.comment_count,
          reposts: track.reposts_count,
          artistId: artist.id,
          link: track.permalink_url,
          releaseDate: track.release_date
            ? new Date(track.release_date)
            : undefined,
        },
      });

      result.push({
        id: dbTrack.id,
        title: dbTrack.title,
        duration: dbTrack.duration,
        source: 'soundcloud',
        artwork: track.artwork_url,
        genre: track.genre,
        tags: track.tag_list,
        license: track.license,
        downloadable: track.downloadable,
        permalink: track.permalink_url,
        waveform: track.waveform_url,
        playbackCount: track.playback_count,
        likes: track.likes_count,
        comments: track.comment_count,
        reposts: track.reposts_count,
        createdAt: dbTrack.createdAt?.toISOString(),
        releaseDate: dbTrack.releaseDate?.toISOString(),
        media: track.media
          ? {
              transcodings: track.media.transcodings?.map((t) => ({
                url: t.url ?? '',
                format: t.format,
                quality: t.quality,
              })),
            }
          : undefined,
        artistMeta: {
          id: artist.id,
          username: artist.name,
          avatar: artist.avatar ?? undefined,
          followers: artist.followers ?? undefined,
          verified: artist.verified ?? undefined,
          permalink: track.user?.permalink_url ?? undefined,
        },
      });
    }

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

  async getStream(id: string): Promise<Readable> {
    const stream = await this.sc.util.streamTrack(id);

    return stream;
  }
}
