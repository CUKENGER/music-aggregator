import { Module } from '@nestjs/common';
import { SearchController } from '../modules/search/search.controller';
import { SearchService } from '../modules/search/search.service';
import { YouTubeProvider } from './youtube/youtube.provider';
import { MUSIC_PROVIDERS } from 'libs/common/consts';
import { SoundCloudProvider } from './soundcloud/soundcloud.provider';
import { DeezerProvider } from './deezer/deezer.provider';

@Module({
  providers: [
    SearchService,
    YouTubeProvider,
    DeezerProvider,
    SoundCloudProvider,
    {
      provide: MUSIC_PROVIDERS,
      useFactory: (
        yt: YouTubeProvider,
        dz: DeezerProvider,
        sc: SoundCloudProvider,
      ) => [yt, dz, sc],
      inject: [YouTubeProvider, DeezerProvider, SoundCloudProvider],
    },
  ],
  controllers: [SearchController],
  exports: [SearchService],
})
export class ProvidersModule {}
