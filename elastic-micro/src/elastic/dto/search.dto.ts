import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SearchDto {
  @IsString()
  @IsNotEmpty()
  index: string;

  @IsString()
  @IsOptional()
  search?: string;
}
