import { UserEntity } from "../../domain/entities/user.entity";

export interface UserRepositoryPort {
    create(user: UserEntity): Promise<void>;
    findById(id: string): Promise<UserEntity | null>;
    findByLogin(login: string): Promise<UserEntity | null>;
    findByEmail(email: string): Promise<UserEntity | null>;
    save(user: UserEntity): Promise<void>;
    softDelete(id: string): Promise<void>;
    search(params: { q?: string; page: number; limit: number }):
        Promise<{ items: UserEntity[]; total: number }>;
}