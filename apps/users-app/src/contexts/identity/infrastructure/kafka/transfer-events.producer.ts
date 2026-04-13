import { Inject, Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import {
  BALANCE_TRANSFER_COMPLETED_TOPIC,
  TransferNotificationEvent,
} from '@app/common';

export const USERS_KAFKA_PRODUCER = 'USERS_KAFKA_PRODUCER';

@Injectable()
export class TransferEventsProducer implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(TransferEventsProducer.name);

  constructor(
    @Inject(USERS_KAFKA_PRODUCER)
    private readonly kafkaClient: ClientKafka,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.kafkaClient.connect();
    this.logger.log('Kafka producer connected');
  }

  async onModuleDestroy(): Promise<void> {
    await this.kafkaClient.close();
  }

  emitTransferCompleted(event: TransferNotificationEvent): void {
    this.kafkaClient.emit(BALANCE_TRANSFER_COMPLETED_TOPIC, event);
    this.logger.log(
      `Transfer event emitted: from=${event.fromUserId} to=${event.toUserId} amount=${event.amount}`,
    );
  }
}
