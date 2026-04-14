import { ApiProperty } from '@nestjs/swagger'
import { IsString, IsUUID, Matches } from 'class-validator'

const MONEY_AMOUNT_REGEX: RegExp = /^\d+(?:\.\d{1,2})?$/

export class TransferBalanceRequestDto {
    @ApiProperty({ format: 'uuid' })
    @IsUUID()
    fromUserId: string

    @ApiProperty({ format: 'uuid' })
    @IsUUID()
    toUserId: string

    @ApiProperty({ example: '20.51' })
    @IsString()
    @Matches(MONEY_AMOUNT_REGEX)
    amount: string
}
