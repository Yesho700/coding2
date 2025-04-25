import { IsAlphanumeric, IsEmail, IsString, MinLength } from "class-validator";


export class LoginDto{

    @IsString()
    @IsEmail()
    email: string;

    @MinLength(8)
    password: string;
}