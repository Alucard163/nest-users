import { Controller, Get, Query, UseInterceptors } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'

import { CacheKey, CacheVersioned, HttpCacheInterceptor } from '../../../../shared/interceptors/cache.interceptor'

import { ListActiveUsersUseCase, ListUsersUseCase } from '../../application/use-cases'
import { ActiveUserWithLastAvatarResponseDto } from '../http/dto/active-user-with-last-avatar.response.dto'
import { ActiveUsersRequestDto } from '../http/dto/active-users.request.dto'
import { QueryUsersRequestDto } from '../http/dto/query-users.request.dto'
import { UserResponseDto } from '../http/dto/user.response.dto'

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
    constructor(
        private readonly listUsers: ListUsersUseCase,
        private readonly listActiveUsers: ListActiveUsersUseCase,
    ) {}

    @Get()
    @UseInterceptors(HttpCacheInterceptor)
    @CacheKey('users:list')
    @CacheVersioned()
    async list(@Query() q: QueryUsersRequestDto) {
        const { items, total } = await this.listUsers.execute(q)
        return {
            total,
            page: q.page,
            limit: q.limit,
            items: items.map((user) => UserResponseDto.from({
                id: user.id,
                login: user.login,
                email: user.email,
                age: user.age,
                balance: user.balance,
                about: user.about,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            })),
        }
    }

    @Get('active')
    public async listActive(@Query() q: ActiveUsersRequestDto): Promise<{ total: number; page: number; limit: number; items: ActiveUserWithLastAvatarResponseDto[] }> {
        const { items, total } = await this.listActiveUsers.execute(q)
        return {
            total,
            page: q.page,
            limit: q.limit,
            items: items.map((item) => ActiveUserWithLastAvatarResponseDto.from(item)),
        }
    }
}
