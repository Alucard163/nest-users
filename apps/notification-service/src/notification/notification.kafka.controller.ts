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
    this.logger.log(
      `Kafka event received: from=${event.fromUserId} to=${event.toUserId} amount=${event.amount}`,
    );
    await this.notificationService.processTransferEvent(event);
  }
}
