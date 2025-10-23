import { UserEntity } from "../../domain/entities/user.entity";

export const USER_REPO = Symbol('USER_REPO');

export interface UserRepository {
    create(user: UserEntity): Promise<void>;
    findById(id: string): Promise<UserEntity | null>;
    findByLogin(login: string): Promise<UserEntity | null>;
    save(user: UserEntity): Promise<void>;
    softDelete(id: string): Promise<void>;
    search(params: { q?: string; page: number; limit: number }):
        Promise<{ items: UserEntity[]; total: number }>;
}