import { NestFactory } from '@nestjs/core';
import { NotificationServiceModule } from './notification-service.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { HttpExceptionFilter } from '@app/common';

async function bootstrap() {
  const app = await NestFactory.create(NotificationServiceModule);
  const configService = app.get(ConfigService);

  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalFilters(new HttpExceptionFilter());

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId:
          configService.get<string>('kafka.clientId') ?? 'notification-service',
        brokers: configService.get<string[]>('kafka.brokers') ?? [
          'localhost:9092',
        ],
      },
      consumer: {
        groupId:
          configService.get<string>('kafka.groupId') ??
          'notification-service-consumer',
      },
    },
  });

  await app.startAllMicroservices();
  await app.listen(configService.get<number>('port') ?? 3001);
}
bootstrap();
