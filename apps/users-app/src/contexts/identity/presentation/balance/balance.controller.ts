import { Body, Controller, ForbiddenException, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { TransferNotificationEvent } from '@app/common';

import { User } from '../../../../shared/decorators';
import { TransferBalanceUseCase } from '../../application/use-cases/transfer-balance.use-case';
import { TransferBalanceRequestDto } from '../http/dto/transfer-balance.request.dto';
import { TransferEventsProducer } from '../../infrastructure/kafka/transfer-events.producer';

/**
 * Контроллер операций с балансом.
 */
@ApiTags('Balance')
@ApiBearerAuth()
@Controller('balance')
export class BalanceController {
  public constructor(
    private readonly transferBalance: TransferBalanceUseCase,
    private readonly transferEventsProducer: TransferEventsProducer,
  ) {}

  /**
   * Перевод денег между пользователями.
   */
  @Post('transfer')
  public async transfer(
    @User('userId') userId: string,
    @Body() dto: TransferBalanceRequestDto,
  ): Promise<{ success: true }> {
    if (dto.fromUserId !== userId)
      throw new ForbiddenException(
        'Нельзя переводить от имени другого пользователя',
      );
    const result = await this.transferBalance.execute(dto);
    const eventPayload: TransferNotificationEvent = {
      fromUserId: dto.fromUserId,
      toUserId: dto.toUserId,
      amount: dto.amount,
      transferredAt: new Date().toISOString(),
    };
    await this.transferEventsProducer.emitTransferCompleted(eventPayload);
    return result;
  }
}
