import {Controller, Get, Query} from '@nestjs/common';
import {ApiBearerAuth, ApiTags} from "@nestjs/swagger";
import {ListUsersUseCase} from "../../application/use-cases";
import {QueryUsersRequestDto} from "../http/dto/query-users.request.dto";
import {UserResponseDto} from "../http/dto/user.response.dto";

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
    constructor(
        private readonly listUsers: ListUsersUseCase
    ) {}

    @Get()
    async list(@Query() q: QueryUsersRequestDto) {
        const { items, total } = await this.listUsers.execute(q);

        return {
            total,
            page: q.page,
            limit: q.limit,
            items: items.map(user => UserResponseDto.from({
                id: user.id,
                login: user.login,
                email: user.email,
                age: user.age,
                about: user.about,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            })),
        };
    }
}
