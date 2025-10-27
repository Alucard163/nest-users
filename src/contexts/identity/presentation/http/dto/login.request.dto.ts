import {ApiProperty} from "@nestjs/swagger";
import {IsString, Length} from "class-validator";

export class LoginRequestDTO {
    @ApiProperty()
    @IsString()
    @Length(3,50)
    login: string;

    @ApiProperty()
    @IsString()
    @Length(6,100)
    password: string;
}