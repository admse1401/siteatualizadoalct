import { IsBoolean, IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @IsOptional() @IsString()
  name?: string;

  @IsOptional() @IsEmail()
  email?: string;

  @IsOptional() @IsString()
  role?: string;

  @IsOptional() @IsString()
  jobTitle?: string;

  @IsOptional() @IsString()
  setor?: string;

  @IsOptional() @IsString()
  department?: string;

  @IsOptional() @IsString()
  phone?: string;

  @IsOptional() @IsString()
  birthDate?: string;

  @IsOptional() @IsString()
  obra?: string;

  @IsOptional() @IsBoolean()
  isActive?: boolean;
}
