import { Module } from '@nestjs/common';
import { MovieService } from './movie.service';
import { MovieController } from './movie.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Director, DirectorSchema } from 'src/schemas/film.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Director.name,
        schema: DirectorSchema,
      },
    ]),
  ],
  providers: [MovieService],
  controllers: [MovieController]
})
export class MovieModule {}
