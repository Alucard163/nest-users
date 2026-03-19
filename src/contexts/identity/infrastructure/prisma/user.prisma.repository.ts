import { Injectable } from '@nestjs/common';
import type { TransferBalanceParams, TransferBalanceResult, } from '../../application/ports';
import { FindMostActiveUsersParams, MostActiveUserWithLastAvatar, UserRepositoryPort, } from '../../application/ports';
import { UserEntity } from '../../domain/entities/user.entity';
import { PrismaService } from './prisma.service';
import { UserPrismaMapper } from './user.prisma.mapper';
import { Prisma } from '../../../../../generated/prisma';
import type { MostActiveUserRow } from './user.prisma.repository.types';

@Injectable()
export class UserPrismaRepository implements UserRepositoryPort {
  constructor(private readonly prismaService: PrismaService) {}

  async create(user: UserEntity): Promise<void> {
    await this.prismaService.user.create({
      data: UserPrismaMapper.toPersistence(user),
    });
  }

  async findById(id: string): Promise<UserEntity | null> {
    const row = await this.prismaService.user.findFirst({
      where: { id, deletedAt: null },
    });
    return row ? UserPrismaMapper.toDomain(row) : null;
  }

  async findByLogin(login: string): Promise<UserEntity | null> {
    const row = await this.prismaService.user.findFirst({
      where: { login, deletedAt: null },
    });
    return row ? UserPrismaMapper.toDomain(row) : null;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const row = await this.prismaService.user.findFirst({
      where: { email, deletedAt: null },
    });
    return row ? UserPrismaMapper.toDomain(row) : null;
  }

  async save(user: UserEntity): Promise<void> {
    await this.prismaService.user.update({
      where: { id: user.id },
      data: UserPrismaMapper.toPersistence(user),
    });
  }

  async search(params: { q?: string; page: number; limit: number }): Promise<{ items: UserEntity[]; total: number }> {
    const { q, page, limit } = params;
    const where = {
      deletedAt: null,
      ...(q ? { login: { contains: q, mode: 'insensitive' as const } } : {}),
    };
    const [rows, total] = await this.prismaService.$transaction([
      this.prismaService.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prismaService.user.count({ where }),
    ]);
    return { items: rows.map(UserPrismaMapper.toDomain), total };
  }

  async softDelete(id: string) {
    await this.prismaService.user.update({
      where: { id },
      data: { deletedAt: new Date(), currentHashedRt: null },
    });
  }

  public async findMostActiveUsers(
    params: FindMostActiveUsersParams,
  ): Promise<{ items: MostActiveUserWithLastAvatar[]; total: number }> {
    const offset: number = (params.page - 1) * params.limit;
    const countResult = await this.prismaService.$queryRaw<[{ total: bigint }]>(
      Prisma.sql`
        WITH active_avatars AS (
            SELECT a."userId"
            FROM "Avatar" a
            WHERE a."deletedAt" IS NULL
            GROUP BY a."userId"
            HAVING COUNT(*) > 2
        )
        SELECT COUNT(*)::bigint AS "total"
        FROM "User" u
        JOIN active_avatars aa ON aa."userId" = u."id"
        WHERE u."deletedAt" IS NULL
            AND u."about" <> ''
            AND u."age" BETWEEN ${params.minAge} AND ${params.maxAge}
      `,
    );
    const total: number = Number(countResult[0]?.total ?? 0);
    if (total === 0) return { items: [], total: 0 };
    const rows: MostActiveUserRow[] = await this.prismaService.$queryRaw<
      MostActiveUserRow[]
    >(Prisma.sql`
        WITH active_avatars AS (
            SELECT
                a."userId" AS "userId",
                COUNT(*) AS "activeAvatarsCount"
            FROM "Avatar" a
            WHERE a."deletedAt" IS NULL
            GROUP BY a."userId"
            HAVING COUNT(*) > 2
        ),
        last_avatars AS (
            SELECT DISTINCT ON (a."userId")
                a."userId" AS "userId",
                a."id" AS "avatarId",
                a."fileName" AS "avatarFileName",
                a."createdAt" AS "avatarCreatedAt"
            FROM "Avatar" a
            WHERE a."deletedAt" IS NULL
            ORDER BY a."userId", a."createdAt" DESC
        )
        SELECT
            u."id" AS "id",
            u."login" AS "login",
            u."email" AS "email",
            u."age" AS "age",
            u."about" AS "about",
            u."createdAt" AS "createdAt",
            u."updatedAt" AS "updatedAt",
            aa."activeAvatarsCount"::int AS "activeAvatarsCount",
            la."avatarId" AS "avatarId",
            la."avatarFileName" AS "avatarFileName",
            la."avatarCreatedAt" AS "avatarCreatedAt"
        FROM "User" u
        JOIN active_avatars aa ON aa."userId" = u."id"
        JOIN last_avatars la ON la."userId" = u."id"
        WHERE u."deletedAt" IS NULL
            AND u."about" <> ''
            AND u."age" BETWEEN ${params.minAge} AND ${params.maxAge}
        ORDER BY aa."activeAvatarsCount" DESC, la."avatarCreatedAt" DESC
        OFFSET ${offset}
        LIMIT ${params.limit}
    `);
    const items: MostActiveUserWithLastAvatar[] = rows.map(
      (row: MostActiveUserRow): MostActiveUserWithLastAvatar => {
        return {
          id: row.id,
          login: row.login,
          email: row.email,
          age: row.age,
          about: row.about,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
          activeAvatarsCount: row.activeAvatarsCount,
          lastAvatar: {
            id: row.avatarId,
            fileName: row.avatarFileName,
            createdAt: row.avatarCreatedAt,
          },
        };
      },
    );
    return { items, total };
  }

  async findByLoginIncludeDeleted(login: string): Promise<UserEntity | null> {
    const row = await this.prismaService.user.findFirst({
      where: { login },
    });
    return row ? UserPrismaMapper.toDomain(row) : null;
  }

  async findByEmailIncludeDeleted(email: string): Promise<UserEntity | null> {
    const row = await this.prismaService.user.findFirst({
      where: { email },
    });
    return row ? UserPrismaMapper.toDomain(row) : null;
  }

  public async resetAllBalances(): Promise<number> {
    const result = await this.prismaService.user.updateMany({
      where: { deletedAt: null },
      data: { balance: new Prisma.Decimal(0) },
    });
    return result.count;
  }

  public async transferBalance(
    params: TransferBalanceParams,
  ): Promise<TransferBalanceResult> {
    const amount: Prisma.Decimal = new Prisma.Decimal(params.amount);
    return this.prismaService.$transaction(
      async (
        tx: Prisma.TransactionClient,
      ): Promise<TransferBalanceResult> => {
        const senderRows = await tx.$queryRaw<{ id: string; balance: Prisma.Decimal }[]>(
          Prisma.sql`SELECT id, balance FROM "User" WHERE id = ${params.fromUserId} AND "deletedAt" IS NULL FOR UPDATE`,
        );
        if (senderRows.length === 0) return { status: 'SENDER_NOT_FOUND' as const };
        const senderBalance = new Prisma.Decimal(senderRows[0].balance);
        if (senderBalance.lessThan(amount)) return { status: 'INSUFFICIENT_FUNDS' as const };
        const receiverRows = await tx.$queryRaw<{ id: string }[]>(
          Prisma.sql`SELECT id FROM "User" WHERE id = ${params.toUserId} AND "deletedAt" IS NULL FOR UPDATE`,
        );
        if (receiverRows.length === 0) return { status: 'RECEIVER_NOT_FOUND' as const };
        await tx.user.update({
          where: { id: params.fromUserId },
          data: { balance: { decrement: amount } },
        });
        await tx.user.update({
          where: { id: params.toUserId },
          data: { balance: { increment: amount } },
        });
        return { status: 'OK' as const };
      },
    );
  }
}
