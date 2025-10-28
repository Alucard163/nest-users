import { PassportStrategy } from "@nestjs/passport";
import { ConfigService } from "@nestjs/config";
import { Injectable } from "@nestjs/common";
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JWTStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(configService: ConfigService) {
        const secret = configService.get<string>('jwt.accessSecret');
        if (!secret) {
            throw new Error('JWT_ACCESS_SECRET is not defined in environment variables');
        }
        
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: secret,
        });
    }

    validate(p: { sub: string; login: string }) {
        return { userId: p.sub, login: p.login };
    }
}