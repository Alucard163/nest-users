import {Body, Controller, HttpCode, HttpStatus, Post} from '@nestjs/common';
import { RegisterRequestDto } from "../http/dto/register.request.dto";
import { ApiTags } from "@nestjs/swagger";
import { Public } from '../../../../shared/decorators';
import { LoginUseCase, RefreshTokenUseCase, RegisterUserUseCase } from "../../application/use-cases";
import { RefreshRequestDto } from "../http/dto/refresh.request.dto";
import { LoginRequestDTO } from "../http/dto/login.request.dto";
import { UserResponseDto } from "../http/dto/user.response.dto";
import { toView } from "../../application/dto/user.view";

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(
        private readonly registerUserUseCase: RegisterUserUseCase,
        private readonly loginUseCase: LoginUseCase,
        private readonly refreshTokenUseCase: RefreshTokenUseCase,
    ) {}

    @Public()
    @Post('register')
    async register(@Body() dto: RegisterRequestDto) {
        const { user, tokens } = await this.registerUserUseCase.execute(dto);

        return { user: UserResponseDto.from(toView(user)), tokens };
    }

    @Public()
    @HttpCode(HttpStatus.OK)
    @Post('login')
    async login(@Body() dto: LoginRequestDTO) {
        const { user, tokens } = await this.loginUseCase.execute(dto);

        return { user: UserResponseDto.from(toView(user)), tokens };
    }

    @Public()
    @HttpCode(HttpStatus.OK)
    @Post('refresh')
    async refresh(@Body() dto: RefreshRequestDto) {
        return this.refreshTokenUseCase.execute(dto);
    }
}

