import { IsString, IsEmail, MinLength, IsAlphanumeric } from 'class-validator';

export class SignUpDto{

    @IsString()
    name: string;

    @IsString()
    @IsEmail()
    email: string;

    @MinLength(8)
    password: string;

}