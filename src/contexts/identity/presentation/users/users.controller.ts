import {Controller, Get, Query, UseGuards} from '@nestjs/common';
import {ApiBearerAuth} from "@nestjs/swagger";
import {JwtAuthGuard} from "../../../../shared/guards/jwt.guard";
import {ListUsersUseCase} from "../../application/use-cases";
import {QueryUsersRequestDto} from "../http/dto/query-users.request.dto";

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
    constructor(private readonly _listUsers: ListUsersUseCase) {}
    @Get()
    async list(@Query() q: QueryUsersRequestDto) {
        return this._listUsers.execute(q); // { items, total, page, limit }
    }
}
