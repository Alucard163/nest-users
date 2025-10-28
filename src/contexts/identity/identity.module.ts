import { Module } from '@nestjs/common';
import { PrismaModule } from "./infrastructure/prisma/prisma.module";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule } from "@nestjs/config";
import { PassportModule } from "@nestjs/passport";
import { AuthController } from "./presentation/auth/auth.controller";
import { ProfileController } from "./presentation/profile/profile.controller";
import { UsersController } from "./presentation/users/users.controller";
import {
    GetMeUseCase,
    ListUsersUseCase,
    LoginUseCase,
    RefreshTokenUseCase,
    RegisterUserUseCase,
    SoftDeleteMeUseCase,
    UpdateMeUseCase
} from "./application/use-cases";
import { BcryptHasherAdapter } from "./infrastructure/crypto/bcrypt.hasher.adapter";
import { HASHER, TOKEN_SERVICE, USER_REPO } from "./application/constants/constants";
import { UserPrismaRepository } from "./infrastructure/prisma/user.prisma.repository";
import { JwtTokenService } from "./infrastructure/jwt/token/token.service";
import { JWTStrategy } from "./infrastructure/jwt/strategies/jwt.strategy";

const controllers = [
    AuthController,
    ProfileController,
    UsersController
];

const useCases = [
    RegisterUserUseCase,
    LoginUseCase,
    RefreshTokenUseCase,
    GetMeUseCase,
    UpdateMeUseCase,
    SoftDeleteMeUseCase,
    ListUsersUseCase
]

@Module({
    imports: [
        PrismaModule,
        JwtModule,
        ConfigModule,
        PassportModule
    ],
    controllers: [
        ...controllers,
    ],
    providers: [
        ...useCases,
        { provide: USER_REPO, useClass: UserPrismaRepository },
        { provide: TOKEN_SERVICE, useClass: JwtTokenService },
        { provide: HASHER, useClass: BcryptHasherAdapter },
        JWTStrategy,
    ]
})
export class IdentityModule {}
