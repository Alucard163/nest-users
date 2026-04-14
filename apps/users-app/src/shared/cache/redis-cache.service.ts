import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

import type { RedisConfig } from './redis-cache.types';

@Injectable()
export class RedisCacheService implements OnModuleDestroy {
  private readonly redis: Redis;

  public constructor(private readonly configService: ConfigService) {
    const config: RedisConfig = this.readConfig();
    this.redis = new Redis({
      host: config.host,
      port: config.port,
      password: config.password,
      lazyConnect: true,
    });
  }

  public async onModuleDestroy(): Promise<void> {
    try {
      await this.redis.quit();
    } catch {
      return;
    }
  }

  public async getJson<T>(key: string): Promise<T | null> {
    try {
      const raw: string | null = await this.redis.get(key);
      if (!raw) return null;
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  public async setJson(
    key: string,
    value: unknown,
    ttlSeconds: number,
  ): Promise<void> {
    try {
      const payload: string = JSON.stringify(value);
      await this.redis.set(key, payload, 'EX', ttlSeconds);
    } catch {
      return;
    }
  }

  public async del(key: string): Promise<number> {
    try {
      return await this.redis.del(key);
    } catch {
      return 0;
    }
  }

  public async getNumber(
    key: string,
    defaultValue: number = 0,
  ): Promise<number> {
    try {
      const raw: string | null = await this.redis.get(key);
      if (!raw) return defaultValue;
      const parsed: number = Number(raw);
      return Number.isFinite(parsed) ? parsed : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  public async incr(key: string): Promise<number> {
    try {
      return await this.redis.incr(key);
    } catch {
      return 0;
    }
  }

  private readConfig(): RedisConfig {
    const host: string =
      this.configService.get<string>('redis.host') ?? 'localhost';
    const port: number = this.configService.get<number>('redis.port') ?? 6380;
    const password: string | undefined =
      this.configService.get<string>('redis.password');
    if (!password)
      throw new Error('REDIS_PASSWORD is not defined in environment variables');
    return { host, port, password };
  }
}
