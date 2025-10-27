import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { USER_REPO } from "../constants/constants";
import type { UserRepositoryPort } from "../ports";
import { UserEntity } from "../../domain/entities/user.entity";

@Injectable()
export class UpdateMeUseCase {
    constructor(
        @Inject(USER_REPO)
        private readonly _users: UserRepositoryPort
    ) {}

    async execute(input: { userId: string; email?: string; age?: number; about?: string }): Promise<UserEntity> {
        const user = await this._users.findById(input.userId);

        if (!user) throw new NotFoundException();
        if (typeof input.email === 'string') user.email = input.email;
        if (typeof input.age === 'number') user.age = input.age;
        if (typeof input.about === 'string') user.about = input.about;

        await this._users.save(user);

        return user;
    }
}