import type { AvatarEntity } from '../../domain/entities/avatar.entity';

export type UploadAvatarFile = {
  readonly buffer: Uint8Array;
  readonly mimetype: string;
};

export type UploadAvatarInput = {
  readonly userId: string;
  readonly file: UploadAvatarFile;
};

export type UploadAvatarResult = {
  readonly avatar: AvatarEntity;
  readonly url: string;
};
