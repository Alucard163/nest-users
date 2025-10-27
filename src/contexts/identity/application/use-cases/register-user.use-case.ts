import {ConflictException, Inject, Injectable} from "@nestjs/common";
import { HASHER, TOKEN_SERVICE, USER_REPO } from "../constants/constants";
import type { HasherPort, TokenServicePort, UserRepositoryPort } from "../ports";
import {UserEntity} from "../../domain/entities/user.entity";

@Injectable()
export class RegisterUserUseCase {
    constructor(
        @Inject(USER_REPO)
        private readonly _users: UserRepositoryPort,
        @Inject(TOKEN_SERVICE)
        private readonly _tokens: TokenServicePort,
        @Inject(HASHER)
        private readonly _hasher: HasherPort,
    ) {}

    async execute(input: { login: string; email: string; password: string; age: number; about: string }) {
        const exists = await this._users.findByLogin(input.login);
        if (exists) throw new ConflictException('Такой логин уже существует');

        const now = new Date();
        const entity = new UserEntity(
            crypto.randomUUID(),
            input.login,
            input.email,
            await this._hasher.hash(input.password),
            input.age,
            input.about,
            null,
            null,
            now,
            now
        );
        await this._users.create(entity);

        const pair = await this._tokens.issuePair(entity.id, entity.login);
        entity.currentHashedRt = await this._hasher.hash(pair.refresh);
        await this._users.save(entity);

        return { user: entity, tokens: pair };
    }
}
