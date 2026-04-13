import { Test, TestingModule } from '@nestjs/testing';
import { GetMeUseCase } from './get-me.use-case';
import { USER_REPO } from '../constants/constants';
import { NotFoundException } from '@nestjs/common';

describe('GetMeUseCase', () => {
    let useCase: GetMeUseCase;
    let userRepo: any;

    beforeEach(async () => {
        userRepo = {
            findById: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GetMeUseCase,
                { provide: USER_REPO, useValue: userRepo },
            ],
        }).compile();

        useCase = module.get<GetMeUseCase>(GetMeUseCase);
    });

    it('should be defined', () => {
        expect(useCase).toBeDefined();
    });

    describe('execute', () => {
        const userId = 'uuid-123';
        const existingUser = {
            id: userId,
            login: 'testuser',
            email: 'test@example.com',
            passwordHash: 'hashedPassword',
            age: 25,
            about: 'Test user',
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
            currentHashedRt: null,
        };

        it('should return user by id', async () => {
            userRepo.findById.mockResolvedValue(existingUser);

            const result = await useCase.execute({ userId });

            expect(userRepo.findById).toHaveBeenCalledWith(userId);
            expect(result).toEqual(existingUser);
        });

        it('should throw NotFoundException if user not found', async () => {
            userRepo.findById.mockResolvedValue(null);

            await expect(useCase.execute({ userId })).rejects.toThrow(NotFoundException);
            
            expect(userRepo.findById).toHaveBeenCalledWith(userId);
        });
    });
});
