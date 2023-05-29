import {
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateArtistDto {
  @IsString()
  @IsNotEmpty()
  id: string

  @IsString()
  @IsOptional()
  artistName?: string;
}
