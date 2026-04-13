import type { AvatarEntity } from '../../domain/entities/avatar.entity';

export interface AvatarRepositoryPort {
  create(avatar: AvatarEntity): Promise<void>;
  findById(id: string): Promise<AvatarEntity | null>;
  countActiveByUserId(userId: string): Promise<number>;
  softDelete(id: string): Promise<void>;
}
