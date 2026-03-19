export type MostActiveUserRow = {
  readonly id: string;
  readonly login: string;
  readonly email: string;
  readonly age: number;
  readonly about: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly activeAvatarsCount: number;
  readonly avatarId: string;
  readonly avatarFileName: string;
  readonly avatarCreatedAt: Date;
  readonly total: number;
};
