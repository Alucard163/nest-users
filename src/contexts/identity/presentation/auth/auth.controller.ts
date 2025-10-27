import {Body, Controller, HttpCode, HttpStatus, Post} from '@nestjs/common';
import { RegisterRequestDto } from "../http/dto/register.request.dto";
import { ApiTags } from "@nestjs/swagger";
import { LoginUseCase, RefreshTokenUseCase, RegisterUserUseCase } from "../../application/use-cases";
import { RefreshRequestDto } from "../http/dto/refresh.request.dto";
import { LoginRequestDTO } from "../http/dto/login.request.dto";
import { UserResponseDto } from "../http/dto/user.response.dto";
import { toView } from "../../application/dto/user.view";

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(
        private readonly _registerUserUseCase: RegisterUserUseCase,
        private readonly _loginUseCase: LoginUseCase,
        private readonly _refreshTokenUseCase: RefreshTokenUseCase,
    ) {}

    @Post('register')
    async register(@Body() dto: RegisterRequestDto) {
        const { user, tokens } = await this._registerUserUseCase.execute(dto);

        return { user: UserResponseDto.from(toView(user)), tokens };
    }

    @HttpCode(HttpStatus.OK)
    @Post('login')
    async login(@Body() dto: LoginRequestDTO) {
        const { user, tokens } = await this._loginUseCase.execute(dto);

        return { user: UserResponseDto.from(toView(user)), tokens };
    }

    @HttpCode(HttpStatus.OK)
    @Post('refresh')
    async refresh(@Body() dto: RefreshRequestDto) {
        return this._refreshTokenUseCase.execute(dto);
    }
}

