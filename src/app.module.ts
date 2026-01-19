import { Module } from '@nestjs/common';
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from '@nestjs/core';
import configuration from "./config/configuration";
import { IdentityModule } from "./contexts/identity/identity.module";
import { HealthController } from './shared/controllers/health.controller';
import { JwtAuthGuard } from './shared/guards/jwt.guard';

@Module({
  imports: [
      ConfigModule.forRoot({
          isGlobal: true,
          load: [configuration],
      }),
      IdentityModule,
  ],
  controllers: [HealthController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
