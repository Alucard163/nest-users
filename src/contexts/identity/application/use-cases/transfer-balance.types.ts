export type TransferBalanceInput = {
  readonly fromUserId: string;
  readonly toUserId: string;
  readonly amount: string;
};

export type TransferBalanceResult = {
  readonly success: true;
};
