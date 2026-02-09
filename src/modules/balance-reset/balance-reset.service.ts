import { InjectQueue } from '@nestjs/bull'
import { Injectable, Logger } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'
import type { Job, Queue } from 'bull'

import { BALANCE_RESET_JOB_NAME, BALANCE_RESET_QUEUE_NAME } from './balance-reset.constants'

@Injectable()
/**
 * Сервис постановки задач обнуления балансов в очередь.
 */
export class BalanceResetService {
    private readonly logger: Logger = new Logger(BalanceResetService.name)

    public constructor(
        @InjectQueue(BALANCE_RESET_QUEUE_NAME)
        private readonly queue: Queue,
    ) {}

    /**
     * Ставит job обнуления балансов в очередь.
     */
    public async enqueueReset(trigger: 'manual' | 'cron'): Promise<{ queued: true }> {
        this.logger.log(`Enqueue balance reset job. trigger=${trigger}`)
        const job: Job = await this.queue.add(BALANCE_RESET_JOB_NAME, { trigger }, {
            attempts: 3,
            backoff: { type: 'exponential', delay: 1000 },
            removeOnComplete: true,
            removeOnFail: false,
        })
        this.logger.debug(`Balance reset job queued. id=${job.id}`)
        return { queued: true }
    }

    /**
     * Каждые 10 минут ставит job обнуления балансов в очередь, пока запущено приложение.
     */
    @Cron('*/10 * * * *')
    public async enqueueResetByCron(): Promise<void> {
        try {
            await this.enqueueReset('cron')
        } catch (e: unknown) {
            this.logger.error('Failed to enqueue balance reset job by cron', e instanceof Error ? e.stack : undefined)
        }
    }
}
