import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsInt, IsOptional, IsString, Max, Min } from "class-validator";
import { Type } from "class-transformer";

export class QueryUsersRequestDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    q?: string;

    @ApiPropertyOptional({ default: 1 })
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page: number = 1;

    @ApiPropertyOptional({ default: 20 })
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    limit: number = 20;
}