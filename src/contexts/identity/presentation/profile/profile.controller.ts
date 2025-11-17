import { Body, Controller, Delete, Get, Patch } from '@nestjs/common';
import { User } from "../../../../shared/decorators";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { GetMeUseCase, SoftDeleteMeUseCase, UpdateMeUseCase } from "../../application/use-cases";
import { UpdateMeRequestDto } from "../http/dto/update-me.request.dto";
import {UserResponseDto} from "../http/dto/user.response.dto";
import {toView} from "../../application/dto/user.view";

@ApiTags('Profile')
@ApiBearerAuth()
@Controller('profile')
export class ProfileController {
    constructor(
        private readonly getMe: GetMeUseCase,
        private readonly updateMe: UpdateMeUseCase,
        private readonly deleteMe: SoftDeleteMeUseCase
    ) {}

    @Get('my')
    async get(
        @User('userId') userId: string
    ) {
        const user = await this.getMe.execute({ userId });

        return UserResponseDto.from(toView(user));
    }

    @Patch()
    async update(
        @User('userId') userId: string,
        @Body() dto: UpdateMeRequestDto
    ) {
        const user = await this.updateMe.execute({ userId, ...dto });

        return UserResponseDto.from(toView(user));
    }

    @Delete()
    async remove(
        @User('userId') userId: string
    ) {
        return await this.deleteMe.execute({ userId });
    }
}
