import { Injectable } from '@nestjs/common';
import {TokenServicePort} from "../../../application/ports";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class JwtTokenService implements TokenServicePort {
    constructor(private readonly jwtService: JwtService, private readonly configService: ConfigService) {}

    async issuePair(userId: string, login: string) {
        const accessData = await this.jwtService.signAsync({ sub: userId, login }, {
            secret: this.configService.get<string>('jwt.accessSecret'),
            expiresIn: this.configService.get('jwt.accessExp'),
        });
        const refreshData = await this.jwtService.signAsync({ sub: userId, login }, {
            secret: this.configService.get<string>('jwt.refreshSecret'),
            expiresIn: this.configService.get('jwt.refreshExp'),
        });
        return { access: accessData, refresh: refreshData };
    }


    verifyRefresh(token: string) {
        return this.jwtService.verifyAsync(token, { secret: this.configService.get<string>('jwt.refreshSecret') }) as any;
    }
}
