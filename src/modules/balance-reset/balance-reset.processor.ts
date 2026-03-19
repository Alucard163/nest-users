import { Process, Processor } from '@nestjs/bull'
import { Inject, Logger } from '@nestjs/common'
import type { Job } from 'bull'

import { USER_REPO } from '../../contexts/identity/application/constants/constants'
import type { UserRepositoryPort } from '../../contexts/identity/application/ports'
import { USERS_LIST_CACHE_VERSION_KEY } from '../../shared/cache/redis-cache.constants'
import { RedisCacheService } from '../../shared/cache/redis-cache.service'

import { BALANCE_RESET_JOB_NAME, BALANCE_RESET_QUEUE_NAME } from './balance-reset.constants'

type BalanceResetJobPayload = {
    readonly trigger: 'manual' | 'cron'
}

@Processor(BALANCE_RESET_QUEUE_NAME)
export class BalanceResetProcessor {
    private readonly logger: Logger = new Logger(BalanceResetProcessor.name)

    public constructor(
        @Inject(USER_REPO)
        private readonly users: UserRepositoryPort,
        private readonly cache: RedisCacheService,
    ) {}

    @Process({ name: BALANCE_RESET_JOB_NAME, concurrency: 1 })
    public async handle(job: Job<BalanceResetJobPayload>): Promise<void> {
        this.logger.log(`Balance reset started. jobId=${job.id} trigger=${job.data.trigger}`)
        const startedAt: number = Date.now()
        const count: number = await this.users.resetAllBalances()
        await this.cache.incr(USERS_LIST_CACHE_VERSION_KEY)
        const durationMs: number = Date.now() - startedAt
        this.logger.log(`Balance reset done. updated=${count} durationMs=${durationMs}`)
    }
}
