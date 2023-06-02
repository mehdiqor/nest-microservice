import { Module } from '@nestjs/common';
import { DirectorModule } from './director/director.module';
import { MovieModule } from './movie/movie.module';

@Module({
  imports: [DirectorModule, MovieModule],
})
export class FilmModule {}
