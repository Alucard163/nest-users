import { UserEntity } from '../../domain/entities/user.entity';

export type UserView = {
  id: string;
  login: string;
  email: string;
  age: number;
  balance: string;
  about: string;
  createdAt: Date;
  updatedAt: Date;
};
export const toView = (u: UserEntity): UserView => ({
  id: u.id,
  login: u.login,
  email: u.email,
  age: u.age,
  balance: u.balance,
  about: u.about,
  createdAt: u.createdAt,
  updatedAt: u.updatedAt,
});
