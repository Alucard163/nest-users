import { ApiProperty } from "@nestjs/swagger";
import { IsString, Length } from "class-validator";

export class RefreshRequestDto {
    @ApiProperty()
    @IsString()
    @Length(10, 1000)
    refreshToken: string;
}