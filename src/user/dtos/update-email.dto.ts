import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class UpdateEmailDto {
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  newEmail: string;
}
