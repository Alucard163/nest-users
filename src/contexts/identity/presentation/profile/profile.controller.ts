import { Body, Controller, Delete, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from "../../../../shared/guards/jwt.guard";
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

    @Get('profile/my')
    async get(
        @Req()
        req
    ) {
        const user = await this._getMe.execute({ userId: req.user.userId });

        return UserResponseDto.from(toView(user));
    }

    @Patch('profile')
    async update(
        @Req()
        req,
        @Body()
        dto: UpdateMeRequestDto
    ) {
        const user = await this._updateMe.execute({ userId: req.user.userId, ...dto });

        return UserResponseDto.from(toView(user));
    }

    @Delete('profile')
    async remove(
        @Req()
        req
    ) {
        return await this._deleteMe.execute({ userId: req.user.userId });
    }
}
