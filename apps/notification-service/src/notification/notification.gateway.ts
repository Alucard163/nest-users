import {
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Inject, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Server, Socket } from 'socket.io';
import { extractBearerToken } from '@app/common';

export const NOTIFICATION_GATEWAY = 'NOTIFICATION_GATEWAY';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class NotificationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(NotificationGateway.name);

  @WebSocketServer()
  private readonly io: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async handleConnection(@ConnectedSocket() client: Socket): Promise<void> {
    this.logger.log(`Client connected: ${client.id}`);

    try {
      const headerAuthorization = client.handshake.headers.authorization;
      const authAuthorization =
        typeof client.handshake.auth?.authorization === 'string'
          ? client.handshake.auth.authorization
          : undefined;
      const token =
        extractBearerToken(headerAuthorization) ??
        extractBearerToken(authAuthorization);

      if (!token) {
        throw new Error('Authorization header is missing');
      }

      const payload = await this.jwtService.verifyAsync<{ sub: string }>(token, {
        secret: this.configService.get<string>('jwt.accessSecret'),
      });

      client.data.userId = payload.sub;
      await client.join(payload.sub);
      this.logger.log(`Client ${client.id} joined room ${payload.sub}`);
    } catch (error) {
      this.logger.warn(
        `Client ${client.id} disconnected due to auth error: ${error instanceof Error ? error.message : 'unknown error'}`,
      );
      client.disconnect(true);
    }
  }

  async handleDisconnect(@ConnectedSocket() client: Socket): Promise<void> {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  async sendNotification(userId: string, data: Record<string, string>): Promise<void> {
    this.io.to(userId).emit('notification', data);
    this.logger.log(`Notification sent to user=${userId}`);
  }
}
