import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { MusicGenre } from 'src/schemas/music.schema';

export class UpdateAlbumDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsOptional()
  albumName?: string;

  @IsString()
  @IsOptional()
  year?: string;

  @IsEnum(MusicGenre)
  @IsOptional()
  genre?: MusicGenre;
}
