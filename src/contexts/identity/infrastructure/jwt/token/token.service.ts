import { Injectable } from '@nestjs/common';
import {TokenServicePort} from "../../../application/ports";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class JwtTokenService implements TokenServicePort {
    constructor(private readonly jwt: JwtService, private readonly cfg: ConfigService) {}

    async issuePair(userId: string, login: string) {
        const a = await this.jwt.signAsync({ sub: userId, login }, {
            secret: this.cfg.get<string>('jwt.accessSecret'),
            expiresIn: this.cfg.get('jwt.accessExp'),
        });
        const r = await this.jwt.signAsync({ sub: userId, login }, {
            secret: this.cfg.get<string>('jwt.refreshSecret'),
            expiresIn: this.cfg.get('jwt.refreshExp'),
        });
        return { access: a, refresh: r };
    }


    verifyRefresh(token: string) {
        return this.jwt.verifyAsync(token, { secret: this.cfg.get<string>('jwt.refreshSecret') }) as any;
    }
}
