import { Inject, Injectable } from "@nestjs/common";
import { USER_REPO } from "../constants/constants";
import type { UserRepositoryPort } from "../ports";
import { UserEntity } from "../../domain/entities/user.entity";

@Injectable()
export class ListUsersUseCase {
    constructor(
        @Inject(USER_REPO)
        private readonly _users: UserRepositoryPort
    ) {}

    async execute(input: { q?: string; page: number; limit: number }):  Promise<{items: UserEntity[], total: number}> {
        return await this._users.search(input);
    }
}