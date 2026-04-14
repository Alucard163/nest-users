import { UserEntity } from '../../domain/entities/user.entity';
import { Injectable } from '@nestjs/common';
import { Prisma } from '../../../../../../../generated/prisma';
import type { User } from '../../../../../../../generated/prisma';

@Injectable()
export class UserPrismaMapper {
  static toDomain(row: User): UserEntity {
    return new UserEntity(
      row.id,
      row.login,
      row.email,
      row.passwordHash,
      row.age,
      row.balance.toString(),
      row.about,
      row.deletedAt,
      row.currentHashedRt,
      row.createdAt,
      row.updatedAt,
    );
  }
  static toPersistence(user: UserEntity): Prisma.UserUncheckedCreateInput {
    const {
      id,
      login,
      email,
      passwordHash,
      age,
      balance,
      about,
      deletedAt,
      currentHashedRt,
    } = user;
    return {
      id,
      login,
      email,
      passwordHash,
      age,
      balance: new Prisma.Decimal(balance),
      about,
      deletedAt,
      currentHashedRt,
    };
  }
}
