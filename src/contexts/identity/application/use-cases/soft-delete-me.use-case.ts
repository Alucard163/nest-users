import { Inject, Injectable } from "@nestjs/common";
import { USER_REPO } from "../constants/constants";
import type { UserRepositoryPort } from "../ports";

@Injectable()
export class SoftDeleteMeUseCase {
    constructor(
        @Inject(USER_REPO)
        private readonly _users: UserRepositoryPort
    ) {}

    async execute(input: { userId: string }): Promise<{success: boolean}> {
        await this._users.softDelete(input.userId);
        return { success: true };
    }
}