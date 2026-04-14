import {ApiPropertyOptional} from "@nestjs/swagger";
import {IsEmail, IsInt, IsOptional, IsString, Length, Max, Min} from "class-validator";

export class UpdateMeRequestDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsEmail()
    email?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsInt()
    @Min(0)
    @Max(150)
    age?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @Length(0,1000)
    about?: string;
}