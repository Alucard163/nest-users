import {Controller, Get, Query, UseGuards} from '@nestjs/common';
import {ApiBearerAuth, ApiTags} from "@nestjs/swagger";
import {JwtAuthGuard} from "../../../../shared/guards/jwt.guard";
import {ListUsersUseCase} from "../../application/use-cases";
import {QueryUsersRequestDto} from "../http/dto/query-users.request.dto";
import {UserResponseDto} from "../http/dto/user.response.dto";

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
    constructor(
        private readonly _listUsers: ListUsersUseCase
    ) {}

    @Get()
    async list(@Query() q: QueryUsersRequestDto) {
        const { items, total } = await this._listUsers.execute(q);

        return {
            total,
            page: q.page,
            limit: q.limit,
            items: items.map(u => UserResponseDto.from({
                id: u.id,
                login: u.login,
                email: u.email,
                age: u.age,
                about: u.about,
                createdAt: u.createdAt,
                updatedAt: u.updatedAt
            })),
        };
    }
}
