import { IsOptional, IsString } from 'class-validator';

export class EnableTwoFactorDto {
  @IsOptional()
  @IsString()
  totp?: string;
}
