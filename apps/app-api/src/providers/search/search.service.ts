import { Inject, Injectable } from '@nestjs/common';
import { IMusicProvider, TrackMeta } from '../interfaces/provider.interface';
import { DeezerProvider } from '../deezer.provider';

@Injectable()
export class SearchService {
  constructor(
    @Inject('MUSIC_PROVIDERS') private providers: IMusicProvider[],
    private deezerProvider: DeezerProvider,
  ) {}

  async searchAll(query: string, limit = 5) {
    const results = await Promise.all(
      this.providers.map((p) => p.search(query, limit).catch(() => [])),
    );
    return results.flat().length
      ? results.flat()
      : [
          {
            id: 'fallback',
            title: `No results for ${query}`,
            artist: 'system',
            source: 'internal',
            duration: 0,
          },
        ];
  }

  async searchDeezer(query: string, limit = 5) {
    return this.deezerProvider.search(query, limit);
  }
}
