import { Body, Controller, Delete, Get, Patch, UseInterceptors } from '@nestjs/common';
import { User } from "../../../../shared/decorators";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { GetMeUseCase, SoftDeleteMeUseCase, UpdateMeUseCase } from "../../application/use-cases";
import { UpdateMeRequestDto } from "../http/dto/update-me.request.dto";
import { UserResponseDto } from "../http/dto/user.response.dto";
import { toView } from "../../application/dto/user.view";
import { USERS_LIST_CACHE_VERSION_KEY } from '../../../../shared/cache/redis-cache.constants'
import { buildProfileMyCacheKey } from '../../../../shared/cache/redis-cache.keys'
import { RedisCacheService } from '../../../../shared/cache/redis-cache.service'
import { CacheKey, HttpCacheInterceptor } from '../../../../shared/interceptors/cache.interceptor'

@ApiTags('Profile')
@ApiBearerAuth()
@Controller('profile')
export class ProfileController {
    constructor(
        private readonly getMe: GetMeUseCase,
        private readonly updateMe: UpdateMeUseCase,
        private readonly deleteMe: SoftDeleteMeUseCase,
        private readonly cache: RedisCacheService,
    ) {}

    @Get('my')
    @UseInterceptors(HttpCacheInterceptor)
    @CacheKey('profile:my')
    async get(
        @User('userId') userId: string
    ) {
        const user = await this.getMe.execute({ userId })
        return UserResponseDto.from(toView(user))
    }

    @Patch()
    async update(
        @User('userId') userId: string,
        @Body() dto: UpdateMeRequestDto
    ) {
        const user = await this.updateMe.execute({ userId, ...dto })
        await this.cache.del(buildProfileMyCacheKey(userId))
        await this.cache.incr(USERS_LIST_CACHE_VERSION_KEY)
        return UserResponseDto.from(toView(user))
    }

    @Delete()
    async remove(
        @User('userId') userId: string
    ) {
        const result = await this.deleteMe.execute({ userId })
        await this.cache.del(buildProfileMyCacheKey(userId))
        await this.cache.incr(USERS_LIST_CACHE_VERSION_KEY)
        return result
    }
}
