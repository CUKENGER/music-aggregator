import { Inject, Injectable } from '@nestjs/common';
import { MUSIC_PROVIDERS } from 'libs/common/consts';
import { IMusicProvider } from '../../providers/types';

@Injectable()
export class StreamService {
  private providerMap = new Map<string, IMusicProvider>();

  constructor(@Inject(MUSIC_PROVIDERS) private providers: IMusicProvider[]) {
    this.providerMap = new Map(providers.map((p) => [p.source, p]));
  }

  async getStream(id: string, source: string) {
    if (source) {
      return this.getProvider(source).getStream(id);
    }

    for (const p of this.providers) {
      try {
        return await p.getStream(id);
      } catch {
        continue;
      }
    }

    throw new Error('No provider available');
  }

  async searchAll(id: string) {
    const results = await Promise.all(
      this.providers.map((p) => p.getStream(id).catch(() => [])),
    );
    return results.flat().length
      ? results.flat()
      : [
          {
            id: 'fallback',
            title: `No results for ${id}`,
            artist: 'system',
            source: 'internal',
            duration: 0,
          },
        ];
  }

  private getProvider(source: string): IMusicProvider {
    const provider = this.providerMap.get(source);

    if (!provider) {
      throw new Error(`Provider ${source} not found`);
    }

    return provider;
  }
}
