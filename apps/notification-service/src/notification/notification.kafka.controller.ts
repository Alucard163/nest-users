import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { BALANCE_TRANSFER_COMPLETED_TOPIC } from '@app/common';
import type { TransferNotificationEvent } from '@app/common';
import { NotificationService } from './notification.service';

@Controller()
export class NotificationKafkaController {
  private readonly logger = new Logger(NotificationKafkaController.name);

  constructor(private readonly notificationService: NotificationService) {}

  @EventPattern(BALANCE_TRANSFER_COMPLETED_TOPIC)
  async handleTransferCompleted(
    @Payload() event: TransferNotificationEvent,
  ): Promise<void> {
    const payload: TransferNotificationEvent =
      'value' in (event as unknown as { value?: TransferNotificationEvent }) &&
      (event as unknown as { value?: TransferNotificationEvent }).value
        ? (event as unknown as { value: TransferNotificationEvent }).value
        : event;
    this.logger.log(
      `Kafka event received: from=${payload.fromUserId} to=${payload.toUserId} amount=${payload.amount}`,
    );
    await this.notificationService.processTransferEvent(payload);
  }
}
