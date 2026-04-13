import { IsString, IsUUID } from 'class-validator';

export class SendNotificationDto {
  @IsUUID()
  userId: string;

  @IsString()
  message: string;
}
