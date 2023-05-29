import { Module } from '@nestjs/common';
import { AlbumController } from './album.controller';
import { AlbumService } from './album.service';
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
  controllers: [AlbumController],
  providers: [AlbumService],
})
export class AlbumModule {}
