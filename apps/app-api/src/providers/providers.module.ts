import { Module } from '@nestjs/common';
import { SearchController } from './search/search.controller';
import { SearchService } from './search/search.service';
import { YouTubeProvider } from './youtube.provider';
import { DeezerProvider } from './deezer.provider';
import { MUSIC_PROVIDERS } from 'libs/common/consts';

@Module({
  providers: [
    SearchService,
    YouTubeProvider,
    DeezerProvider,
    {
      provide: MUSIC_PROVIDERS,
      useFactory: (yt: YouTubeProvider, dz: DeezerProvider) => [yt, dz],
      inject: [YouTubeProvider, DeezerProvider],
    },
  ],
  controllers: [SearchController],
  exports: [SearchService],
})
export class ProvidersModule {}
