import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { HASHER, TOKEN_SERVICE, USER_REPO } from "../constants/constants";
import type { HasherPort, TokenServicePort, UserRepositoryPort } from "../ports";

@Injectable()
export class RefreshTokenUseCase {
    constructor(
        @Inject(USER_REPO)
        private readonly _users: UserRepositoryPort,
        @Inject(HASHER)
        private readonly _hasher: HasherPort,
        @Inject(TOKEN_SERVICE)
        private readonly _tokens: TokenServicePort,
    ) {}

    async execute(input: { refreshToken: string }): Promise<{access: string, refresh: string}> {
        const payload = await this._tokens.verifyRefresh(input.refreshToken).catch(() => null);
        if (!payload) throw new UnauthorizedException();

        const user = await this._users.findById(payload.sub);
        if (!user || !user.currentHashedRt || user.isDeleted) throw new UnauthorizedException();
        const match = await this._hasher.compare(input.refreshToken, user.currentHashedRt);
        if (!match) throw new UnauthorizedException('Token revoked');

        const pair = await this._tokens.issuePair(user.id, user.login);
        user.currentHashedRt = await this._hasher.hash(pair.refresh);
        await this._users.save(user);

        return pair;
    }
}