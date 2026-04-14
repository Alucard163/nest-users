import { Injectable } from '@nestjs/common';

import type { AvatarRepositoryPort } from '../../application/ports';
import type { AvatarEntity } from '../../domain/entities/avatar.entity';

import { PrismaService } from './prisma.service';
import { AvatarPrismaMapper } from './avatar.prisma.mapper';

@Injectable()
export class AvatarPrismaRepository implements AvatarRepositoryPort {
  constructor(private readonly prismaService: PrismaService) {}

  public async create(avatar: AvatarEntity): Promise<void> {
    await this.prismaService.avatar.create({
      data: AvatarPrismaMapper.toPersistence(avatar),
    });
  }

  public async findById(id: string): Promise<AvatarEntity | null> {
    const row = await this.prismaService.avatar.findFirst({ where: { id } });
    return row ? AvatarPrismaMapper.toDomain(row) : null;
  }

  public async countActiveByUserId(userId: string): Promise<number> {
    return this.prismaService.avatar.count({
      where: { userId, deletedAt: null },
    });
  }

  public async softDelete(id: string): Promise<void> {
    await this.prismaService.avatar.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
