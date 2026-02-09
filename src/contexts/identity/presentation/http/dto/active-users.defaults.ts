export type ActiveUsersDefaults = {
    readonly minAge: number
    readonly maxAge: number
    readonly page: number
    readonly limit: number
}

export const ACTIVE_USERS_DEFAULTS: ActiveUsersDefaults = {
    minAge: 0,
    maxAge: 200,
    page: 1,
    limit: 20,
}
