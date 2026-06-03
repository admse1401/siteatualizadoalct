import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty({ message: 'Informe seu e-mail ou matrícula' })
  identifier: string;

  @IsString()
  @IsNotEmpty({ message: 'Informe sua senha' })
  password: string;
}
