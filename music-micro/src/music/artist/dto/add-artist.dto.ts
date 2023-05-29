import {
  IsNotEmpty,
  IsString,
} from 'class-validator';

export class AddArtistDto {
  @IsString()
  @IsNotEmpty()
  artistName: string;
}
