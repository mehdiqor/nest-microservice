import { Module } from '@nestjs/common';
import { ArtistModule } from './artist/artist.module';
import { AlbumModule } from './album/album.module';
import { TrackModule } from './track/track.module';

@Module({
  imports: [
    ArtistModule,
    AlbumModule,
    TrackModule,
  ],
})
export class MusicModule {}
