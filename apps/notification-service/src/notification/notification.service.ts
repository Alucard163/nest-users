import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TransferNotificationEvent } from '@app/common';
import { NotificationGateway } from './notification.gateway';
import { Notification, NotificationDocument } from './notification.schema';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<NotificationDocument>,
    @Inject(NotificationGateway)
    private readonly notificationGateway: NotificationGateway,
  ) {}

  sendManualNotification(userId: string, message: string): { success: true } {
    this.notificationGateway.sendNotification(userId, { data: message });
    return { success: true };
  }

  async processTransferEvent(
    event: TransferNotificationEvent,
  ): Promise<{ success: true }> {
    const transferredAt = new Date(event.transferredAt);

    const senderPayload = {
      data: `Перевод выполнен: вы отправили ${event.amount} пользователю ${event.toUserId}`,
      fromUserId: event.fromUserId,
      toUserId: event.toUserId,
      amount: event.amount,
      transferredAt: transferredAt.toISOString(),
    };

    const receiverPayload = {
      data: `Поступление: вы получили ${event.amount} от пользователя ${event.fromUserId}`,
      fromUserId: event.fromUserId,
      toUserId: event.toUserId,
      amount: event.amount,
      transferredAt: transferredAt.toISOString(),
    };

    this.notificationGateway.sendNotification(event.fromUserId, senderPayload);
    this.notificationGateway.sendNotification(event.toUserId, receiverPayload);

    await this.notificationModel.insertMany([
      {
        targetUserId: event.fromUserId,
        fromUserId: event.fromUserId,
        toUserId: event.toUserId,
        amount: event.amount,
        transferredAt,
      },
      {
        targetUserId: event.toUserId,
        fromUserId: event.fromUserId,
        toUserId: event.toUserId,
        amount: event.amount,
        transferredAt,
      },
    ]);

    this.logger.log(
      `Transfer notification processed: from=${event.fromUserId} to=${event.toUserId}`,
    );

    return { success: true };
  }
}
