import { PassportStrategy } from "@nestjs/passport";
import { ConfigService } from "@nestjs/config";
import { Injectable } from "@nestjs/common";
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JWTStrategy {
    // доделать
    // extends PassportStrategy(Strategy, 'jwt')
    constructor(configService: ConfigService) {
        // super({
        //     jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        //     secretOrKey: configService.get<string>('jwt.accessSecret'),
        // });
    }

    validate(p: { sub: string; login: string }) {
        return { userId: p.sub, login: p.login };
    }
}