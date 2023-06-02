import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { MovieGenre } from 'src/schemas/film.schema';

export class AddMovieDto {
  @IsString()
  @IsNotEmpty()
  directorName: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  year?: string;

  @IsEnum(MovieGenre)
  @IsNotEmpty()
  genre: MovieGenre;

  @IsString()
  @IsOptional()
  link?: string;
}
