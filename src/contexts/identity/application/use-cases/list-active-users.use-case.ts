import { BadRequestException, Inject, Injectable, Logger } from '@nestjs/common';

import { FILE_STORAGE, USER_REPO } from '../constants/constants';
import type {
  FileStoragePort,
  MostActiveUserWithLastAvatar,
  UserRepositoryPort,
} from '../ports';

import type {
  ListActiveUsersInput,
  ListActiveUsersItem,
  ListActiveUsersResult,
} from './list-active-users.types';

@Injectable()
export class ListActiveUsersUseCase {
  private readonly logger: Logger = new Logger(ListActiveUsersUseCase.name);

  constructor(
    @Inject(USER_REPO)
    private readonly users: UserRepositoryPort,
    @Inject(FILE_STORAGE)
    private readonly fileStorage: FileStoragePort,
  ) {}

  public async execute(
    input: ListActiveUsersInput,
  ): Promise<ListActiveUsersResult> {
    this.logger.debug(`List active users requested. minAge=${input.minAge} maxAge=${input.maxAge} page=${input.page} limit=${input.limit}`);
    if (input.minAge > input.maxAge) {
      this.logger.warn(`Invalid age range. minAge=${input.minAge} maxAge=${input.maxAge}`);
      throw new BadRequestException('Некорректный диапазон возраста');
    }
    const {
      items,
      total,
    }: { items: MostActiveUserWithLastAvatar[]; total: number } =
      await this.users.findMostActiveUsers({
        minAge: input.minAge,
        maxAge: input.maxAge,
        page: input.page,
        limit: input.limit,
      });
    const mappedItems: ListActiveUsersItem[] = items.map(
      (item: MostActiveUserWithLastAvatar): ListActiveUsersItem => {
        return {
          id: item.id,
          login: item.login,
          email: item.email,
          age: item.age,
          about: item.about,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
          activeAvatarsCount: item.activeAvatarsCount,
          lastAvatar: {
            id: item.lastAvatar.id,
            fileName: item.lastAvatar.fileName,
            url: this.fileStorage.getPublicUrl(item.lastAvatar.fileName),
            createdAt: item.lastAvatar.createdAt,
          },
        };
      },
    );
    this.logger.log(`Active users found. total=${total} returned=${mappedItems.length}`);
    return { total, items: mappedItems };
  }
}
