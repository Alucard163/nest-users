import { randomUUID } from 'crypto';

import { ConflictException, Inject, Injectable, Logger } from '@nestjs/common';

import { AVATAR_REPO, FILE_STORAGE } from '../constants/constants';
import type { AvatarRepositoryPort } from '../ports/avatar.repository.port';
import type { FileStoragePort } from '../ports/file-storage.port';
import { AvatarEntity } from '../../domain/entities/avatar.entity';

import { MAX_ACTIVE_AVATARS } from './upload-avatar.constants';
import type {
  UploadAvatarInput,
  UploadAvatarResult,
} from './upload-avatar.types';

@Injectable()
export class UploadAvatarUseCase {
  private readonly logger: Logger = new Logger(UploadAvatarUseCase.name);

  constructor(
    @Inject(AVATAR_REPO)
    private readonly avatars: AvatarRepositoryPort,
    @Inject(FILE_STORAGE)
    private readonly fileStorage: FileStoragePort,
  ) {}

  public async execute(input: UploadAvatarInput): Promise<UploadAvatarResult> {
    this.logger.debug(`Upload avatar requested. userId=${input.userId}`);
    const activeCount: number = await this.avatars.countActiveByUserId(
      input.userId,
    );
    if (activeCount >= MAX_ACTIVE_AVATARS) {
      this.logger.warn(`Avatar limit reached. userId=${input.userId} activeCount=${activeCount}`);
      throw new ConflictException('Достигнут лимит активных аватаров');
    }
    const now: Date = new Date();
    const extension: string =
      input.file.mimetype === 'image/png' ? 'png' : 'jpg';
    const fileId: string = randomUUID();
    const fileName: string = `${input.userId}/${fileId}.${extension}`;
    await this.fileStorage.uploadFile({
      key: fileName,
      body: input.file.buffer,
      contentType: input.file.mimetype,
    });
    const avatar: AvatarEntity = new AvatarEntity(
      fileId,
      input.userId,
      fileName,
      now,
      null,
    );
    await this.avatars.create(avatar);
    this.logger.log(`Avatar uploaded. userId=${input.userId} avatarId=${fileId}`);
    return { avatar, url: this.fileStorage.getPublicUrl(fileName) };
  }
}
