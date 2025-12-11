import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';

/**
 * DTO for user registration
 */
export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(3)
  @MaxLength(20)
  username: string;

  @IsString()
  @MinLength(6)
  @MaxLength(100)
  password: string;
}

/**
 * DTO for user login
 */
export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
