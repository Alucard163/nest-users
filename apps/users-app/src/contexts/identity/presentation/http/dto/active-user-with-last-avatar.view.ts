export type ActiveUserWithLastAvatarView = {
    readonly id: string
    readonly login: string
    readonly email: string
    readonly age: number
    readonly about: string
    readonly createdAt: Date
    readonly updatedAt: Date
    readonly activeAvatarsCount: number
    readonly lastAvatar: {
        readonly id: string
        readonly fileName: string
        readonly url: string
        readonly createdAt: Date
    }
}
