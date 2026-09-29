import { IsNotEmpty, IsString } from 'class-validator';

export class LinkChildDto {
  @IsString()
  @IsNotEmpty()
  studentIdentifier: string;
}
