import { ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsInt, Max, Min } from 'class-validator'

import { ACTIVE_USERS_DEFAULTS } from './active-users.defaults'

export class ActiveUsersRequestDto {
    @ApiPropertyOptional({ default: ACTIVE_USERS_DEFAULTS.minAge })
    @Type(() => Number)
    @IsInt()
    @Min(0)
    minAge: number = ACTIVE_USERS_DEFAULTS.minAge

    @ApiPropertyOptional({ default: ACTIVE_USERS_DEFAULTS.maxAge })
    @Type(() => Number)
    @IsInt()
    @Min(0)
    @Max(150)
    maxAge: number = ACTIVE_USERS_DEFAULTS.maxAge

    @ApiPropertyOptional({ default: ACTIVE_USERS_DEFAULTS.page })
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page: number = ACTIVE_USERS_DEFAULTS.page

    @ApiPropertyOptional({ default: ACTIVE_USERS_DEFAULTS.limit })
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    limit: number = ACTIVE_USERS_DEFAULTS.limit
}
