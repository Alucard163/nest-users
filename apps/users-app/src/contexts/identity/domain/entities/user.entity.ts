export class UserEntity {
  constructor(
    public readonly id: string,
    public login: string,
    public email: string,
    public passwordHash: string,
    public age: number,
    public balance: string,
    public about: string,
    public deletedAt: Date | null,
    public currentHashedRt: string | null,
    public createdAt: Date,
    public updatedAt: Date,
  ) {}
  get isDeleted() {
    return !!this.deletedAt;
  }
}
