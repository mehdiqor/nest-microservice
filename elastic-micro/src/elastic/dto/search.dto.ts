import { IsNotEmpty, IsString } from 'class-validator';

export class SearchDto {
  @IsString()
  @IsNotEmpty()
  index: string;

  @IsString()
  @IsNotEmpty()
  search: string;
}
