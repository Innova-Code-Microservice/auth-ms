import { IsString, IsStrongPassword } from "class-validator";


export class LoginUserDto {

    @IsString()
    email: string;

    @IsString()
    @IsStrongPassword()
    password: string;

}