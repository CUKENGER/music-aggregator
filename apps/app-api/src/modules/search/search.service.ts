import { Inject, Injectable } from '@nestjs/common';
import { DeezerProvider } from '../../providers/deezer/deezer.provider';
import { IMusicProvider } from '../../providers/types';
import { MUSIC_PROVIDERS } from 'libs/common/consts';

@Injectable()
export class SearchService {
  private providerMap = new Map<string, IMusicProvider>();
  constructor(
    @Inject(MUSIC_PROVIDERS) private providers: IMusicProvider[],
    private deezerProvider: DeezerProvider,
  ) {
    providers.forEach((p) => this.providerMap.set(p.source, p));
  }

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

  async search(query: string, source?: string, limit = 5) {
    if (!source) {
      return this.searchAll(query, limit);
    }

    const provider = this.getProvider(source);

    return provider.search(query, limit);
  }

  async searchDeezer(query: string, limit = 5) {
    return this.deezerProvider.search(query, limit);
  }

  private getProvider(source: string): IMusicProvider {
    const provider = this.providerMap.get(source);

    if (!provider) {
      throw new Error(`Provider ${source} not found`);
    }

    return provider;
  }
}
