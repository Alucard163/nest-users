import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { USER_REPO } from '../constants/constants';
import type { UserRepositoryPort } from '../ports';

@Injectable()
export class SoftDeleteMeUseCase {
  constructor(
    @Inject(USER_REPO)
    private readonly users: UserRepositoryPort,
  ) {}

  async execute(input: { userId: string }): Promise<{ success: boolean }> {
    const user = await this.users.findById(input.userId);
    if (!user) throw new NotFoundException('Пользователь не найден');
    await this.users.softDelete(input.userId);
    return { success: true };
  }
}
