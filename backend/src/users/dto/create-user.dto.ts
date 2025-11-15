import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class CreateUserDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsEnum(['admin', 'usuario', 'directivo'], {
    message: 'El rol debe ser admin, usuario o directivo',
  })
  role: UserRole = 'usuario';

  @IsOptional()
  @IsEmail()
  recoveryEmail?: string;

  @IsOptional()
  @IsString()
  recoveryPhone?: string;
}
