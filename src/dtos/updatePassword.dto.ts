import { MinLength } from "class-validator";

export class UpdatePasswordDto{

    @MinLength(8)
    newPassword: string;

}