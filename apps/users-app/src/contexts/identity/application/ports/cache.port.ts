export interface CachePort {
    del(key: string): Promise<number>;
    incr(key: string): Promise<number>;
}
