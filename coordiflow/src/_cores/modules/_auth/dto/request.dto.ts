import { Expose } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsPhoneNumber, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { ToLowerCase } from 'src/_cores/utils/decorators/tranform.lowercase.decorator';

export namespace AuthRequestDto {
    export class LoginLocalDataDto {

        @ToLowerCase()
        @IsString()
        email: string;

        @IsString()
        @IsNotEmpty()
        password: string;
    }

    export class PasswordDto {
        @IsString()
        @IsNotEmpty()
        value: string;
    }

    export class PayloadTokenDto {
        @IsNotEmpty()
        id: string;
        @IsNotEmpty()
        email: string;
        @IsNotEmpty()
        username: string;
        @IsNotEmpty()
        phone: string;
        @IsNotEmpty()
        role: string;
        exp?: any;
    }

    export class RegisterDataDto {
        @IsEmail()
        @IsNotEmpty()
        @ToLowerCase()
        @Expose()
        email: string;

        @IsString()
        @MinLength(4)
        @MaxLength(20)
        @IsNotEmpty()
        @Expose()
        username: string;

        @IsString()
        @IsNotEmpty()
        @IsPhoneNumber()
        @Expose()
        phone: string;

        @IsString()
        @MinLength(8)
        @MaxLength(20)
        @Matches(/^(?=.*[a-z])(?=.*\d)(?=.*[\W_])(?!.*\s).{8,}$/, {
            message: 'Password must be at least 8 characters long, contain at least 1 lowercase letter, 1 number, 1 special character, and no spaces.',
          })          
        @IsNotEmpty()
        @Expose()
        password: string;
    }
}
