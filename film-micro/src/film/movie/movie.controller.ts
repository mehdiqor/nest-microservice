import { Controller } from '@nestjs/common';
import { MovieService } from './movie.service';
import { MessagePattern } from '@nestjs/microservices';
import { AddMovieDto, UpdateMovieDto } from './dto';

@Controller('movie')
export class MovieController {
  constructor(private readonly movieService: MovieService) {}

  @MessagePattern('add-movie')
  addMovie(dto: AddMovieDto) {
    return this.movieService.addMovie(dto);
  }

  @MessagePattern('update-movie')
  updateMovie(dto: UpdateMovieDto) {
    return this.movieService.updateMovie(dto);
  }

  @MessagePattern('remove-movie')
  removeMovie(data) {
    return this.movieService.removeMovie(data);
  }
}
