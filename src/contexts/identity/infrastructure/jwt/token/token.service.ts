import { Injectable } from '@nestjs/common';
import { TokenServicePort } from '../../../application/ports';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtTokenService implements TokenServicePort {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async issuePair(userId: string, login: string): Promise<{ access: string; refresh: string }> {
    const accessData: string = await this.jwtService.signAsync(
      { sub: userId, login },
      {
        secret: this.configService.get<string>('jwt.accessSecret'),
        expiresIn: this.configService.get('jwt.accessExp'),
      },
    );
    const refreshData: string = await this.jwtService.signAsync(
      { sub: userId, login },
      {
        secret: this.configService.get<string>('jwt.refreshSecret'),
        expiresIn: this.configService.get('jwt.refreshExp'),
      },
    );
    return { access: accessData, refresh: refreshData };
  }

  async verifyRefresh(token: string): Promise<{ sub: string; login: string }> {
    return this.jwtService.verifyAsync<{ sub: string; login: string }>(token, {
      secret: this.configService.get<string>('jwt.refreshSecret'),
    });
  }
}
