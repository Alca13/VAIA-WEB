import { IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  token!: string;

  @IsString()
  userId!: string;

  @IsString()
  @MinLength(8)
  newPassword!: string;
}
