import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AddTrackDto {
  @IsString()
  @IsNotEmpty()
  artistName: string;

  @IsString()
  @IsNotEmpty()
  albumName: string;

  @IsString()
  @IsNotEmpty()
  trackName: string;

  @IsString({ each: true })
  @IsOptional()
  tags?: string;

  @IsString()
  @IsOptional()
  youtube_link?: string;

  @IsString()
  @IsNotEmpty()
  fileName: string;

  @IsString()
  @IsNotEmpty()
  filePath: string;

  @IsString()
  @IsNotEmpty()
  length: string;
}
