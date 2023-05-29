import { Module } from '@nestjs/common';
import { TrackController } from './track.controller';
import { TrackService } from './track.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Artist,
  ArtistSchema,
} from 'src/schemas/music.schema';
import { diskStorage } from 'multer';
import { MulterModule } from '@nestjs/platform-express';
import { join } from 'path';

@Module({
  imports: [
    MulterModule.registerAsync({
      useFactory: async () => ({
        dest: join(
          __dirname,
          '..',
          '..',
          '..',
          'uploads',
          'musics',
        ),
        limits: { fileSize: 50000000 },
        fileFilter: (req, file, cb) => {
          if (
            !file.originalname.match(
              /\.(mp3|m4a)$/,
            )
          ) {
            return cb(
              new Error(
                'Only audio files are allowed!',
              ),
              false,
            );
          }
          cb(null, true);
        },
        storage: diskStorage({
          destination: join(
            __dirname,
            '..',
            '..',
            '..',
            'uploads',
            'musics',
          ),
          // filename: editFileName,
        }),
      }),
    }),
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
