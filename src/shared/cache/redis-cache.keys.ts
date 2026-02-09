export type UsersListCacheKeyInput = {
  readonly version: number;
  readonly q?: string;
  readonly page: number;
  readonly limit: number;
};

export const buildUsersListCacheKey = (
  input: UsersListCacheKeyInput,
): string => {
  const q: string = encodeURIComponent(input.q ?? '');
  return `users:list:v${input.version}:q=${q}:page=${input.page}:limit=${input.limit}`;
};

export const buildProfileMyCacheKey = (userId: string): string => {
  return `profile:my:${userId}`;
};
