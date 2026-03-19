import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';

import { CACHE_SERVICE, USER_REPO } from '../constants/constants';
import type { CachePort, UserRepositoryPort } from '../ports';
import type { TransferBalanceResult as RepoTransferBalanceResult } from '../ports/user.repository.balance.types';

import type {
  TransferBalanceInput,
  TransferBalanceResult,
} from './transfer-balance.types';

const MONEY_AMOUNT_REGEX: RegExp = /^\d+(?:\.\d{1,2})?$/;

const parseAmountToCents = (amount: string): bigint | null => {
  if (!MONEY_AMOUNT_REGEX.test(amount)) return null;
  const [integerPart, fractionPart = '']: string[] = amount.split('.');
  const normalizedInteger: string = integerPart.replace(/^0+(?=\d)/, '');
  const normalizedFraction: string = fractionPart.padEnd(2, '0');
  if (normalizedFraction.length !== 2) return null;
  const centsString: string = `${normalizedInteger}${normalizedFraction}`;
  return BigInt(centsString);
};

const USERS_LIST_CACHE_VERSION_KEY: string = 'users:list:version';

/**
 * Use-case перевода денег между пользователями.
 * Требования:
 * - сумма с точностью до 2 знаков после запятой
 * - баланс не уходит в отрицательное значение
 * - операция выполняется транзакционно
 */
@Injectable()
export class TransferBalanceUseCase {
  private readonly logger: Logger = new Logger(TransferBalanceUseCase.name);

  public constructor(
    @Inject(USER_REPO)
    private readonly users: UserRepositoryPort,
    @Inject(CACHE_SERVICE)
    private readonly cache: CachePort,
  ) {}

  /**
   * Переводит деньги с одного баланса на другой.
   */
  public async execute(
    input: TransferBalanceInput,
  ): Promise<TransferBalanceResult> {
    this.logger.debug(
      `Transfer requested: from=${input.fromUserId} to=${input.toUserId} amount=${input.amount}`,
    );
    if (input.fromUserId === input.toUserId)
      throw new BadRequestException('Нельзя переводить самому себе');
    const cents: bigint | null = parseAmountToCents(input.amount);
    if (!cents || cents <= 0n)
      throw new BadRequestException('Некорректная сумма');
    const status: RepoTransferBalanceResult =
      await this.users.transferBalance(input);
    if (status.status === 'SENDER_NOT_FOUND')
      throw new NotFoundException('Отправитель не найден');
    if (status.status === 'RECEIVER_NOT_FOUND')
      throw new NotFoundException('Получатель не найден');
    if (status.status === 'INSUFFICIENT_FUNDS')
      throw new BadRequestException('Недостаточно средств');
    await this.cache.del(`profile:my:${input.fromUserId}`);
    await this.cache.del(`profile:my:${input.toUserId}`);
    await this.cache.incr(USERS_LIST_CACHE_VERSION_KEY);
    this.logger.log(
      `Transfer completed: from=${input.fromUserId} to=${input.toUserId} amount=${input.amount}`,
    );
    return { success: true };
  }
}
