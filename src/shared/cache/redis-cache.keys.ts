export const buildProfileMyCacheKey = (userId: string): string => {
  return `profile:my:${userId}`;
};
