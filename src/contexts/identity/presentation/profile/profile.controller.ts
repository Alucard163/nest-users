import {Body, Controller, Delete, Get, Patch, Req, UseGuards} from '@nestjs/common';
import {JwtAuthGuard} from "../../../../shared/guards/jwt.guard";
import {ApiBearerAuth} from "@nestjs/swagger";
import {GetMeUseCase, SoftDeleteMeUseCase, UpdateMeUseCase} from "../../application/use-cases";
import {UpdateMeRequestDto} from "../http/dto/update-me.request.dto";

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
    get(@Req() req) {
        return this._getMe.execute({ userId: req.user.userId });
    }
    @Patch('profile')
    update(@Req() req, @Body() dto: UpdateMeRequestDto) {
        return this._updateMe.execute({ userId: req.user.userId, ...dto });
    }
    @Delete('profile')
    remove(@Req() req) {
        return this._deleteMe.execute({ userId: req.user.userId });
    }
}
