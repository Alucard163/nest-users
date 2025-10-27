import { Module } from '@nestjs/common';
import { JwtTokenService } from './token/token.service';
import { JwtModule as NestJwtModule } from '@nestjs/jwt';

@Module({
    providers: [JwtTokenService],
    imports: [NestJwtModule.register({})],
    exports: [NestJwtModule]
})
export class JwtModule {}
