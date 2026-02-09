export class AvatarEntity {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly fileName: string,
    public readonly createdAt: Date,
    public readonly deletedAt: Date | null,
  ) {}

  public get isDeleted(): boolean {
    return !!this.deletedAt;
  }
}
