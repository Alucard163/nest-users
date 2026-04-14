import { BullModule } from '@nestjs/bull'
import { Module } from '@nestjs/common'

import { USER_REPO } from '../../contexts/identity/application/constants/constants'
import { PrismaModule } from '../../contexts/identity/infrastructure/prisma/prisma.module'
import { UserPrismaRepository } from '../../contexts/identity/infrastructure/prisma/user.prisma.repository'
import { RedisCacheModule } from '../../shared/cache/redis-cache.module'

import { BALANCE_RESET_QUEUE_NAME } from './balance-reset.constants'
import { BalanceResetController } from './balance-reset.controller'
import { BalanceResetProcessor } from './balance-reset.processor'
import { BalanceResetService } from './balance-reset.service'

@Module({
    imports: [
        PrismaModule,
        RedisCacheModule,
        BullModule.registerQueue({
            name: BALANCE_RESET_QUEUE_NAME,
        }),
    ],
    controllers: [BalanceResetController],
    providers: [
        BalanceResetService,
        BalanceResetProcessor,
        { provide: USER_REPO, useClass: UserPrismaRepository },
    ],
})
export class BalanceResetModule {}
