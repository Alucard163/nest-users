import { ApiProperty } from '@nestjs/swagger'

import type { ActiveUserWithLastAvatarView } from './active-user-with-last-avatar.view'

export class ActiveUserWithLastAvatarResponseDto {
    @ApiProperty()
    id: string

    @ApiProperty()
    login: string

    @ApiProperty()
    email: string

    @ApiProperty()
    age: number

    @ApiProperty()
    about: string

    @ApiProperty()
    createdAt: Date

    @ApiProperty()
    updatedAt: Date

    @ApiProperty()
    activeAvatarsCount: number

    @ApiProperty()
    lastAvatar: {
        readonly id: string
        readonly fileName: string
        readonly url: string
        readonly createdAt: Date
    }

    public static from(v: ActiveUserWithLastAvatarView): ActiveUserWithLastAvatarResponseDto {
        return Object.assign(new ActiveUserWithLastAvatarResponseDto(), v)
    }
}
