import { Body, Controller, Delete, Get, Patch, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from "../../../../shared/guards/jwt.guard";
import { User } from "../../../../shared/decorators";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { GetMeUseCase, SoftDeleteMeUseCase, UpdateMeUseCase } from "../../application/use-cases";
import { UpdateMeRequestDto } from "../http/dto/update-me.request.dto";
import {UserResponseDto} from "../http/dto/user.response.dto";
import {toView} from "../../application/dto/user.view";

@ApiTags('Profile')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('profile')
export class ProfileController {
    constructor(
        private readonly _getMe: GetMeUseCase,
        private readonly _updateMe: UpdateMeUseCase,
        private readonly _deleteMe: SoftDeleteMeUseCase
    ) {}

    @Get('my')
    async get(
        @User('userId') userId: string
    ) {
        const user = await this._getMe.execute({ userId });

        return UserResponseDto.from(toView(user));
    }

    @Patch()
    async update(
        @User('userId') userId: string,
        @Body() dto: UpdateMeRequestDto
    ) {
        const user = await this._updateMe.execute({ userId, ...dto });

        return UserResponseDto.from(toView(user));
    }

    @Delete()
    async remove(
        @User('userId') userId: string
    ) {
        return await this._deleteMe.execute({ userId });
    }
}
