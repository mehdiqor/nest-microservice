import {
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateTrackDto {
  @IsString()
  @IsNotEmpty()
  trackId: string;

  @IsString()
  @IsOptional()
  trackName?: string;

  @IsString({ each: true })
  @IsOptional()
  tags?: string;

  @IsString()
  @IsOptional()
  youtube_link?: string;
}
