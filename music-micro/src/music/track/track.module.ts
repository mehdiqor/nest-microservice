import { Module } from '@nestjs/common';
import { TrackController } from './track.controller';
import { TrackService } from './track.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Artist,
  ArtistSchema,
} from 'src/schemas/music.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Artist.name,
        schema: ArtistSchema,
      },
    ]),
  ],
  controllers: [TrackController],
  providers: [TrackService],
})
export class TrackModule {}
