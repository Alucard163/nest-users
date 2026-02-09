import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

import { RedisCacheService } from '../cache/redis-cache.service';
import { CACHE_TTL_SECONDS, USERS_LIST_CACHE_VERSION_KEY } from '../cache/redis-cache.constants';

export const CACHE_KEY_METADATA = 'cache_key';
export const CACHE_TTL_METADATA = 'cache_ttl';
export const CACHE_VERSIONED_METADATA = 'cache_versioned';

export const CacheKey = (key: string) => SetMetadata(CACHE_KEY_METADATA, key);
export const CacheTTL = (ttl: number) => SetMetadata(CACHE_TTL_METADATA, ttl);
export const CacheVersioned = () => SetMetadata(CACHE_VERSIONED_METADATA, true);

@Injectable()
export class HttpCacheInterceptor implements NestInterceptor {
  constructor(
    private readonly cache: RedisCacheService,
    private readonly reflector: Reflector,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<unknown>> {
    const cacheKeyPrefix = this.reflector.get<string>(
      CACHE_KEY_METADATA,
      context.getHandler(),
    );
    if (!cacheKeyPrefix) return next.handle();
    const ttl =
      this.reflector.get<number>(CACHE_TTL_METADATA, context.getHandler()) ??
      CACHE_TTL_SECONDS;
    const isVersioned = this.reflector.get<boolean>(
      CACHE_VERSIONED_METADATA,
      context.getHandler(),
    );
    const request = context.switchToHttp().getRequest<Request>();
    const queryString = this.buildQueryString(request.query);
    let cacheKey: string;
    if (isVersioned) {
      const version = await this.cache.getNumber(USERS_LIST_CACHE_VERSION_KEY, 0);
      cacheKey = `${cacheKeyPrefix}:v${version}:${queryString}`;
    } else {
      cacheKey = `${cacheKeyPrefix}:${queryString}`;
    }
    const cached = await this.cache.getJson<unknown>(cacheKey);
    if (cached) return of(cached);
    return next.handle().pipe(
      tap(async (response: unknown) => {
        await this.cache.setJson(cacheKey, response, ttl);
      }),
    );
  }

  private buildQueryString(query: Record<string, unknown>): string {
    const sorted = Object.keys(query)
      .sort()
      .map((key) => `${key}=${encodeURIComponent(String(query[key] ?? ''))}`)
      .join('&');
    return sorted || 'default';
  }
}
