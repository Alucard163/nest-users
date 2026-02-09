import type { Avatar as AvatarRow } from '../../../../../generated/prisma';

import { AvatarEntity } from '../../domain/entities/avatar.entity';

export class AvatarPrismaMapper {
  public static toDomain(row: AvatarRow): AvatarEntity {
    return new AvatarEntity(
      row.id,
      row.userId,
      row.fileName,
      row.createdAt,
      row.deletedAt,
    );
  }

  public static toPersistence(entity: AvatarEntity): {
    id: string;
    userId: string;
    fileName: string;
    deletedAt: Date | null;
  } {
    return {
      id: entity.id,
      userId: entity.userId,
      fileName: entity.fileName,
      deletedAt: entity.deletedAt,
    };
  }
}
