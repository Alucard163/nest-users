import { Module } from '@nestjs/common';
import { PrismaModule } from "./infrastructure/prisma/prisma.module";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule } from "@nestjs/config";
import { PassportModule } from "@nestjs/passport";
import { AuthController } from "./presentation/auth/auth.controller";
import { ProfileController } from "./presentation/profile/profile.controller";
import { UsersController } from "./presentation/users/users.controller";
import { AvatarsController } from './presentation/avatars/avatars.controller';
import { BalanceController } from './presentation/balance/balance.controller'
import {
    GetMeUseCase,
    ListActiveUsersUseCase,
    ListUsersUseCase,
    LoginUseCase,
    DeleteAvatarUseCase,
    RefreshTokenUseCase,
    RegisterUserUseCase,
    SoftDeleteMeUseCase,
    TransferBalanceUseCase,
    UpdateMeUseCase,
    UploadAvatarUseCase
} from "./application/use-cases";
import { BcryptHasherAdapter } from "./infrastructure/crypto/bcrypt.hasher.adapter";
import { AVATAR_REPO, CACHE_SERVICE, FILE_STORAGE, HASHER, TOKEN_SERVICE, USER_REPO } from "./application/constants/constants";
import { RedisCacheService } from '../../shared/cache/redis-cache.service';
import { UserPrismaRepository } from "./infrastructure/prisma/user.prisma.repository";
import { AvatarPrismaRepository } from './infrastructure/prisma/avatar.prisma.repository';
import { JwtTokenService } from "./infrastructure/jwt/token/token.service";
import { JWTStrategy } from "./infrastructure/jwt/strategies/jwt.strategy";
import { S3Module } from '../../providers/files/s3.module';
import { S3Service } from '../../providers/files/s3.service';

const controllers = [
    AuthController,
    ProfileController,
    UsersController,
    AvatarsController,
    BalanceController,
];

const useCases = [
    RegisterUserUseCase,
    LoginUseCase,
    RefreshTokenUseCase,
    GetMeUseCase,
    UpdateMeUseCase,
    SoftDeleteMeUseCase,
    ListUsersUseCase,
    ListActiveUsersUseCase,
    UploadAvatarUseCase,
    DeleteAvatarUseCase,
    TransferBalanceUseCase,
]

@Module({
    imports: [
        PrismaModule,
        JwtModule,
        ConfigModule,
        PassportModule,
        S3Module
    ],
    controllers: [
        ...controllers,
    ],
    providers: [
        ...useCases,
        { provide: USER_REPO, useClass: UserPrismaRepository },
        { provide: AVATAR_REPO, useClass: AvatarPrismaRepository },
        { provide: TOKEN_SERVICE, useClass: JwtTokenService },
        { provide: HASHER, useClass: BcryptHasherAdapter },
        { provide: FILE_STORAGE, useClass: S3Service },
        { provide: CACHE_SERVICE, useExisting: RedisCacheService },
        JWTStrategy,
    ]
})
export class IdentityModule {}
