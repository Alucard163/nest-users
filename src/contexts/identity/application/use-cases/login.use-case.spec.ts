import { Test, TestingModule } from '@nestjs/testing';
import { LoginUseCase } from './login.use-case';
import { HASHER, TOKEN_SERVICE, USER_REPO } from '../constants/constants';
import { UnauthorizedException } from '@nestjs/common';

describe('LoginUseCase', () => {
    let useCase: LoginUseCase;
    let userRepo: any;
    let hasher: any;
    let tokenService: any;

    beforeEach(async () => {
        userRepo = {
            findByLogin: jest.fn(),
            save: jest.fn(),
        };

        hasher = {
            compare: jest.fn(),
            hash: jest.fn(),
        };

        tokenService = {
            issuePair: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                LoginUseCase,
                { provide: USER_REPO, useValue: userRepo },
                { provide: HASHER, useValue: hasher },
                { provide: TOKEN_SERVICE, useValue: tokenService },
            ],
        }).compile();

        useCase = module.get<LoginUseCase>(LoginUseCase);
    });

    it('should be defined', () => {
        expect(useCase).toBeDefined();
    });

    describe('execute', () => {
        const loginDto = {
            login: 'testuser',
            password: 'password123',
        };

        const existingUser = {
            id: 'uuid-123',
            login: 'testuser',
            email: 'test@example.com',
            passwordHash: 'hashedPassword',
            age: 25,
            about: 'Test user',
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
            currentHashedRt: null,
            isDeleted: false,
        };

        it('should successfully login user with correct credentials', async () => {
            userRepo.findByLogin.mockResolvedValue(existingUser);
            hasher.compare.mockResolvedValue(true);
            hasher.hash.mockResolvedValue('hashedRefreshToken');
            
            const tokens = {
                access: 'access_token',
                refresh: 'refresh_token',
            };
            tokenService.issuePair.mockResolvedValue(tokens);
            const result = await useCase.execute(loginDto);

            expect(userRepo.findByLogin).toHaveBeenCalledWith(loginDto.login);
            expect(hasher.compare).toHaveBeenCalledWith(loginDto.password, existingUser.passwordHash);
            expect(tokenService.issuePair).toHaveBeenCalledWith(existingUser.id, existingUser.login);
            expect(hasher.hash).toHaveBeenCalledWith(tokens.refresh);
            expect(userRepo.save).toHaveBeenCalled();
            
            expect(result).toEqual({
                user: existingUser,
                tokens: tokens,
            });
        });

        it('should throw UnauthorizedException if user not found', async () => {
            userRepo.findByLogin.mockResolvedValue(null);

            await expect(useCase.execute(loginDto)).rejects.toThrow(UnauthorizedException);
            await expect(useCase.execute(loginDto)).rejects.toThrow('Введены неверные данные или такого пользователя не существует');
            
            expect(userRepo.findByLogin).toHaveBeenCalledWith(loginDto.login);
            expect(hasher.compare).not.toHaveBeenCalled();
        });

        it('should throw UnauthorizedException if password is incorrect', async () => {
            userRepo.findByLogin.mockResolvedValue(existingUser);
            hasher.compare.mockResolvedValue(false);

            await expect(useCase.execute(loginDto)).rejects.toThrow(UnauthorizedException);
            await expect(useCase.execute(loginDto)).rejects.toThrow('Введены неверные данные или такого пользователя не существует');
            
            expect(userRepo.findByLogin).toHaveBeenCalledWith(loginDto.login);
            expect(hasher.compare).toHaveBeenCalledWith(loginDto.password, existingUser.passwordHash);
            expect(tokenService.issuePair).not.toHaveBeenCalled();
        });

        it('should throw UnauthorizedException if user is deleted', async () => {
            const deletedUser = { ...existingUser, deletedAt: new Date(), isDeleted: true };
            userRepo.findByLogin.mockResolvedValue(deletedUser);

            await expect(useCase.execute(loginDto)).rejects.toThrow(UnauthorizedException);
            await expect(useCase.execute(loginDto)).rejects.toThrow('Введены неверные данные или такого пользователя не существует');
            
            expect(userRepo.findByLogin).toHaveBeenCalledWith(loginDto.login);
            expect(hasher.compare).not.toHaveBeenCalled();
        });
    });
});
