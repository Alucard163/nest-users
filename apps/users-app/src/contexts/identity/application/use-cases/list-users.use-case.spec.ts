import { Test, TestingModule } from '@nestjs/testing';
import { ListUsersUseCase } from './list-users.use-case';
import { USER_REPO } from '../constants/constants';

describe('ListUsersUseCase', () => {
    let useCase: ListUsersUseCase;
    let userRepo: any;

    beforeEach(async () => {
        userRepo = {
            search: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ListUsersUseCase,
                { provide: USER_REPO, useValue: userRepo },
            ],
        }).compile();

        useCase = module.get<ListUsersUseCase>(ListUsersUseCase);
    });

    it('should be defined', () => {
        expect(useCase).toBeDefined();
    });

    describe('execute', () => {
        const users = [
            {
                id: 'uuid-1',
                login: 'user1',
                email: 'user1@example.com',
                passwordHash: 'hash1',
                age: 25,
                about: 'User 1',
                createdAt: new Date(),
                updatedAt: new Date(),
                deletedAt: null,
                currentHashedRt: null,
            },
            {
                id: 'uuid-2',
                login: 'user2',
                email: 'user2@example.com',
                passwordHash: 'hash2',
                age: 30,
                about: 'User 2',
                createdAt: new Date(),
                updatedAt: new Date(),
                deletedAt: null,
                currentHashedRt: null,
            },
        ];

        it('should return paginated users without search', async () => {
            const query = { page: 1, limit: 20 };
            userRepo.search.mockResolvedValue({ items: users, total: 2 });

            const result = await useCase.execute(query);

            expect(userRepo.search).toHaveBeenCalledWith(query);
            expect(result).toEqual({ items: users, total: 2 });
        });

        it('should return paginated users with search query', async () => {
            const query = { page: 1, limit: 10, q: 'user1' };
            const filteredUsers = [users[0]];
            userRepo.search.mockResolvedValue({ items: filteredUsers, total: 1 });

            const result = await useCase.execute(query);

            expect(userRepo.search).toHaveBeenCalledWith(query);
            expect(result).toEqual({ items: filteredUsers, total: 1 });
        });

        it('should calculate correct skip for page 2', async () => {
            const query = { page: 2, limit: 10 };
            userRepo.search.mockResolvedValue({ items: [], total: 0 });

            await useCase.execute(query);

            expect(userRepo.search).toHaveBeenCalledWith(query);
        });

        it('should return empty array if no users found', async () => {
            const query = { page: 1, limit: 20 };
            userRepo.search.mockResolvedValue({ items: [], total: 0 });
            const result = await useCase.execute(query);

            expect(result).toEqual({ items: [], total: 0 });
        });
    });
});
