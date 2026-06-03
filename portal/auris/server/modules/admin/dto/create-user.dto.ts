import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateUserDto {
  @IsString() @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsString() @IsNotEmpty()
  role: string;

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
}
