import { Module } from '@nestjs/common';
import { JwtTokenService } from './token/token.service';

@Module({
  providers: [JwtTokenService]
})
export class JwtModule {}
