import { ApiProperty } from '@nestjs/swagger'

export class AvatarResponseDto {
    @ApiProperty()
    id: string

    @ApiProperty()
    fileName: string

    @ApiProperty()
    url: string

    @ApiProperty()
    createdAt: Date

    public static from(v: { id: string; fileName: string; url: string; createdAt: Date }): AvatarResponseDto {
        return Object.assign(new AvatarResponseDto(), v)
    }
}
