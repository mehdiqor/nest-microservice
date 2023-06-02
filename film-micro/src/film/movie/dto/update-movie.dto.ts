import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { MovieGenre } from 'src/schemas/film.schema';

export class UpdateMovieDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  year?: string;

  @IsEnum(MovieGenre)
  @IsOptional()
  genre?: MovieGenre;

  @IsString()
  @IsOptional()
  link?: string;
}
