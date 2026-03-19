export type ListActiveUsersInput = {
  readonly minAge: number;
  readonly maxAge: number;
  readonly page: number;
  readonly limit: number;
};

export type ListActiveUsersItem = {
  readonly id: string;
  readonly login: string;
  readonly email: string;
  readonly age: number;
  readonly about: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly activeAvatarsCount: number;
  readonly lastAvatar: {
    readonly id: string;
    readonly fileName: string;
    readonly url: string;
    readonly createdAt: Date;
  };
};

export type ListActiveUsersResult = {
  readonly total: number;
  readonly items: ListActiveUsersItem[];
};
