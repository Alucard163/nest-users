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
        const existsByLogin = await this._users.findByLogin(input.login);
        if (existsByLogin) throw new ConflictException('Такой логин уже существует');

        const existsByEmail = await this._users.findByEmail(input.email);
        if (existsByEmail) throw new ConflictException('Такой email уже существует');

        const now = new Date();
        const userId = crypto.randomUUID();
        const pair = await this._tokens.issuePair(userId, input.login);
        
        const entity = new UserEntity(
            userId,
            input.login,
            input.email,
            await this._hasher.hash(input.password),
            input.age,
            input.about,
            null,
            await this._hasher.hash(pair.refresh),
            now,
            now
        );
        await this._users.create(entity);

        return { user: entity, tokens: pair };
    }
}
