import { IsEmail, IsInt, IsString, Length, Max, Min } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class RegisterRequestDto {
    @ApiProperty()
    @IsString()
    @Length(3,50)
    login: string;

    @ApiProperty()
    @IsEmail()
    email: string;

    @ApiProperty()
    @IsString()
    @Length(6,100)
    password: string;

    @ApiProperty()
    @IsInt()
    @Min(0)
    @Max(150)
    age: number;

    @ApiProperty()
    @IsString()
    @Length(0,1000)
    about: string;
}
