import { UserEntity } from '../../domain/entities/user.entity';

import type {
  FindMostActiveUsersParams,
  MostActiveUserWithLastAvatar,
} from './user.repository.types';
import type {
  TransferBalanceParams,
  TransferBalanceResult,
} from './user.repository.balance.types';

export interface UserRepositoryPort {
  create(user: UserEntity): Promise<void>;
  findById(id: string): Promise<UserEntity | null>;
  findByLogin(login: string): Promise<UserEntity | null>;
  findByLoginIncludeDeleted(login: string): Promise<UserEntity | null>;
  findByEmail(email: string): Promise<UserEntity | null>;
  findByEmailIncludeDeleted(email: string): Promise<UserEntity | null>;
  save(user: UserEntity): Promise<void>;
  softDelete(id: string): Promise<void>;
  search(params: {
    q?: string;
    page: number;
    limit: number;
  }): Promise<{ items: UserEntity[]; total: number }>;
  findMostActiveUsers(
    params: FindMostActiveUsersParams,
  ): Promise<{ items: MostActiveUserWithLastAvatar[]; total: number }>;
  transferBalance(
    params: TransferBalanceParams,
  ): Promise<TransferBalanceResult>;
  resetAllBalances(): Promise<number>;
}
