import {
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';

import { AVATAR_REPO } from '../constants/constants';
import type { AvatarRepositoryPort } from '../ports';

import type { DeleteAvatarInput } from './delete-avatar.types';

@Injectable()
export class DeleteAvatarUseCase {
  private readonly logger: Logger = new Logger(DeleteAvatarUseCase.name);

  constructor(
    @Inject(AVATAR_REPO)
    private readonly avatars: AvatarRepositoryPort,
  ) {}

  public async execute(input: DeleteAvatarInput): Promise<{ success: true }> {
    this.logger.debug(`Delete avatar requested. userId=${input.userId} avatarId=${input.avatarId}`);
    const avatar = await this.avatars.findById(input.avatarId);
    if (!avatar) {
      this.logger.warn(`Avatar not found. avatarId=${input.avatarId}`);
      throw new NotFoundException();
    }
    if (avatar.userId !== input.userId) {
      this.logger.warn(`Forbidden: avatar belongs to another user. avatarId=${input.avatarId} ownerId=${avatar.userId}`);
      throw new ForbiddenException();
    }
    if (avatar.isDeleted) {
      this.logger.warn(`Avatar already deleted. avatarId=${input.avatarId}`);
      throw new NotFoundException();
    }
    await this.avatars.softDelete(input.avatarId);
    this.logger.log(`Avatar deleted. userId=${input.userId} avatarId=${input.avatarId}`);
    return { success: true };
  }
}
