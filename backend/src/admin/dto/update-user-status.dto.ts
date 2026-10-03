import { IsIn, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateUserStatusDto {
  @IsNotEmpty()
  @IsIn(['ACTIVE', 'SUSPENDED'], {
    message: 'Status must be either ACTIVE or SUSPENDED.',
  })
  status!: 'ACTIVE' | 'SUSPENDED';

  @IsOptional()
  @IsString()
  @MaxLength(255)
  reason?: string;
}
