import { Module } from '@nestjs/common';
import { ArtistService } from './artist.service';
import { ArtistController } from './artist.controller';
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
  controllers: [ArtistController],
  providers: [ArtistService],
})
export class ArtistModule {}
