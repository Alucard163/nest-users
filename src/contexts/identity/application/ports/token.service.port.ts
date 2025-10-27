export interface TokenServicePort {
    issuePair(userId: string, login: string): Promise<{ access: string; refresh: string }>;
    verifyRefresh(token: string): Promise<{ sub: string; login: string }>;
}