import { Controller, Post } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'

import { BalanceResetService } from './balance-reset.service'

/**
 * Контроллер для постановки задачи обнуления балансов всех пользователей в очередь.
 */
@ApiTags('Balance Reset')
@ApiBearerAuth()
@Controller('balance-reset')
export class BalanceResetController {
    public constructor(private readonly service: BalanceResetService) {}

    /**
     * Добавляет job обнуления балансов в очередь и возвращает ответ сразу.
     */
    @Post()
    public async reset(): Promise<{ queued: true }> {
        return this.service.enqueueReset('manual')
    }
}
