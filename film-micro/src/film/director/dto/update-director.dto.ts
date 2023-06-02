import {
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateDirectorDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsOptional()
  name?: string;
}
