import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import type { HasherPort, UserRepositoryPort, TokenServicePort } from '../ports';
import { HASHER, TOKEN_SERVICE, USER_REPO } from "../constants/constants";

@Injectable()
export class LoginUseCase {
    constructor(
        @Inject(USER_REPO)
        private readonly _users: UserRepositoryPort,
        @Inject(HASHER)
        private readonly _hasher: HasherPort,
        @Inject(TOKEN_SERVICE)
        private readonly _tokens: TokenServicePort,
    ) {}

    async execute(input: { login: string; password: string }) {
        const user = await this._users.findByLogin(input.login);
        if (!user || user.isDeleted) throw new UnauthorizedException('Введены неверные данные или такого пользователя не существует');

        const ok = await this._hasher.compare(input.password, user.passwordHash);
        if (!ok) throw new UnauthorizedException('Введены неверные данные или такого пользователя не существует');

        const pair = await this._tokens.issuePair(user.id, user.login);
        user.currentHashedRt = await this._hasher.hash(pair.refresh);
        await this._users.save(user);

        return { user, tokens: pair };
    }
}