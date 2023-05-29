import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { MusicGenre } from 'src/schemas/music.schema';

export class AddAlbumDto {
  @IsString()
  @IsNotEmpty()
  artistId: string;

  @IsString()
  @IsNotEmpty()
  albumName: string;

  @IsString()
  @IsOptional()
  year?: string;

  @IsEnum(MusicGenre)
  @IsNotEmpty()
  genre: MusicGenre;
}
