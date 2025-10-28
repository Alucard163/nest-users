import { Test, TestingModule } from '@nestjs/testing';
import { RegisterUserUseCase } from './register-user.use-case';
import { HASHER, TOKEN_SERVICE, USER_REPO } from '../constants/constants';
import { ConflictException } from '@nestjs/common';

describe('RegisterUserUseCase', () => {
    let useCase: RegisterUserUseCase;
    let userRepo: any;
    let hasher: any;
    let tokenService: any;

    beforeEach(async () => {
        userRepo = {
            findByLogin: jest.fn(),
            findByEmail: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
        };

        hasher = {
            hash: jest.fn(),
        };

        tokenService = {
            issuePair: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                RegisterUserUseCase,
                { provide: USER_REPO, useValue: userRepo },
                { provide: HASHER, useValue: hasher },
                { provide: TOKEN_SERVICE, useValue: tokenService },
            ],
        }).compile();

        useCase = module.get<RegisterUserUseCase>(RegisterUserUseCase);
    });

    it('should be defined', () => {
        expect(useCase).toBeDefined();
    });

    describe('execute', () => {
        const registerDto = {
            login: 'testuser',
            email: 'test@example.com',
            password: 'password123',
            age: 25,
            about: 'Test user',
        };

        it('should successfully register a new user', async () => {
            userRepo.findByLogin.mockResolvedValue(null);
            userRepo.findByEmail.mockResolvedValue(null);
            hasher.hash.mockResolvedValue('hashedPassword');
            
            const savedUser = {
                id: 'uuid-123',
                login: registerDto.login,
                email: registerDto.email,
                passwordHash: 'hashedPassword',
                age: registerDto.age,
                about: registerDto.about,
                createdAt: new Date(),
                updatedAt: new Date(),
                deletedAt: null,
                currentHashedRt: null,
            };
            userRepo.save.mockResolvedValue(savedUser);

            const tokens = {
                access: 'access_token',
                refresh: 'refresh_token',
            };
            tokenService.issuePair.mockResolvedValue(tokens);

            const result = await useCase.execute(registerDto);

            expect(userRepo.findByLogin).toHaveBeenCalledWith(registerDto.login);
            expect(userRepo.findByEmail).toHaveBeenCalledWith(registerDto.email);
            expect(hasher.hash).toHaveBeenCalled();
            expect(tokenService.issuePair).toHaveBeenCalled();
            expect(userRepo.create).toHaveBeenCalled();
            expect(userRepo.save).not.toHaveBeenCalled();
            
            expect(result).toHaveProperty('user');
            expect(result).toHaveProperty('tokens');
            expect(result.tokens).toEqual(tokens);
        });

        it('should throw ConflictException if login already exists', async () => {
            userRepo.findByLogin.mockResolvedValue({ id: 'existing-user' });

            await expect(useCase.execute(registerDto)).rejects.toThrow(ConflictException);
            await expect(useCase.execute(registerDto)).rejects.toThrow('Такой логин уже существует');
            
            expect(userRepo.findByLogin).toHaveBeenCalledWith(registerDto.login);
            expect(userRepo.findByEmail).not.toHaveBeenCalled();
            expect(hasher.hash).not.toHaveBeenCalled();
        });

    });
});
