import { Body, Controller, Post } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { SendNotificationDto } from './dto/send-notification.dto';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post('send')
  async sendNotification(
    @Body() dto: SendNotificationDto,
  ): Promise<{ success: true }> {
    return this.notificationService.sendManualNotification(dto.userId, dto.message);
  }
}
