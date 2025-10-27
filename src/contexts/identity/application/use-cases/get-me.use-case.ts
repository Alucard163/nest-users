import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { USER_REPO } from "../constants/constants";
import type { UserRepositoryPort } from "../ports";
import { UserEntity } from "../../domain/entities/user.entity";

@Injectable()
export class GetMeUseCase {
    constructor(
        @Inject(USER_REPO)
        private readonly _users: UserRepositoryPort
    ) {}

    async execute(input: { userId: string }): Promise<UserEntity> {
        const u = await this._users.findById(input.userId);

        if (!u) throw new NotFoundException();

        return u;
    }
}