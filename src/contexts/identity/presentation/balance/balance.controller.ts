import { Body, Controller, ForbiddenException, Post } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'

import { User } from '../../../../shared/decorators'
import { TransferBalanceUseCase } from '../../application/use-cases/transfer-balance.use-case'
import { TransferBalanceRequestDto } from '../http/dto/transfer-balance.request.dto'

/**
 * Контроллер операций с балансом.
 */
@ApiTags('Balance')
@ApiBearerAuth()
@Controller('balance')
export class BalanceController {
    public constructor(private readonly transferBalance: TransferBalanceUseCase) {}

    /**
     * Перевод денег между пользователями.
     */
    @Post('transfer')
    public async transfer(
        @User('userId') userId: string,
        @Body() dto: TransferBalanceRequestDto,
    ): Promise<{ success: true }> {
        if (dto.fromUserId !== userId) throw new ForbiddenException('Нельзя переводить от имени другого пользователя')
        return this.transferBalance.execute(dto)
    }
}
