import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type NotificationDocument = HydratedDocument<Notification>;

@Schema({ collection: 'notifications', timestamps: true })
export class Notification {
  @Prop({ required: true })
  targetUserId: string;

  @Prop({ required: true })
  fromUserId: string;

  @Prop({ required: true })
  toUserId: string;

  @Prop({ required: true })
  amount: string;

  @Prop({ required: true })
  transferredAt: Date;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
