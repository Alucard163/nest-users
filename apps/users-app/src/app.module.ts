import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { BullModule } from '@nestjs/bull';
import { ScheduleModule } from '@nestjs/schedule';
import configuration from './config/configuration';
import { IdentityModule } from './contexts/identity/identity.module';
import { HealthController } from './shared/controllers/health.controller';
import { JwtAuthGuard } from './shared/guards/jwt.guard';
import { RedisCacheModule } from './shared/cache/redis-cache.module';
import { BalanceResetModule } from './modules/balance-reset/balance-reset.module';
import type { RedisConfig } from './shared/cache/redis-cache.types';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    ScheduleModule.forRoot(),
    BullModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        const host: string =
          configService.get<string>('redis.host') ?? 'localhost';
        const port: number = configService.get<number>('redis.port') ?? 6380;
        const password: string | undefined =
          configService.get<string>('redis.password');
        if (!password)
          throw new Error(
            'REDIS_PASSWORD is not defined in environment variables',
          );
        const redis: RedisConfig = { host, port, password };
        return { redis };
      },
      inject: [ConfigService],
    }),
    RedisCacheModule,
    IdentityModule,
    BalanceResetModule,
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
