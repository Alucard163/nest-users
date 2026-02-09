export type TransferBalanceParams = {
  readonly fromUserId: string;
  readonly toUserId: string;
  readonly amount: string;
};

export type TransferBalanceResult =
  | { readonly status: 'OK' }
  | { readonly status: 'SENDER_NOT_FOUND' }
  | { readonly status: 'RECEIVER_NOT_FOUND' }
  | { readonly status: 'INSUFFICIENT_FUNDS' };
