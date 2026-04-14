export const BALANCE_TRANSFER_COMPLETED_TOPIC = 'balance.transfer.completed';

export type TransferNotificationEvent = {
  readonly fromUserId: string;
  readonly toUserId: string;
  readonly amount: string;
  readonly transferredAt: string;
};
