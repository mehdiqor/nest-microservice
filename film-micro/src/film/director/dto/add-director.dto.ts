import {
  IsNotEmpty,
  IsString,
} from 'class-validator';

export class AddDirectorDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
