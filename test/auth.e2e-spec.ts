import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/contexts/identity/infrastructure/prisma/prisma.service';

describe('AuthController (e2e)', () => {
    let app: INestApplication;
    let prisma: PrismaService;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.setGlobalPrefix('api');
        app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
        
        prisma = app.get<PrismaService>(PrismaService);
        
        await app.init();
    });

    afterAll(async () => {
        await prisma.$disconnect();
        await app.close();
    });

    beforeEach(async () => {
        await prisma.user.deleteMany();
    });

    describe('/api/auth/register (POST)', () => {
        const registerDto = {
            login: 'testuser',
            email: 'test@example.com',
            password: 'password123',
            age: 25,
            about: 'Test user for e2e testing',
        };

        it('should register a new user and return tokens', () => {
            return request(app.getHttpServer())
                .post('/api/auth/register')
                .send(registerDto)
                .expect(201)
                .expect((res) => {
                    expect(res.body).toHaveProperty('user');
                    expect(res.body).toHaveProperty('tokens');
                    expect(res.body.user.login).toBe(registerDto.login);
                    expect(res.body.user.email).toBe(registerDto.email);
                    expect(res.body.user.age).toBe(registerDto.age);
                    expect(res.body.user).not.toHaveProperty('passwordHash');
                    expect(res.body.tokens).toHaveProperty('access');
                    expect(res.body.tokens).toHaveProperty('refresh');
                });
        });

        it('should return 400 if validation fails', () => {
            return request(app.getHttpServer())
                .post('/api/auth/register')
                .send({
                    login: 'ab',
                    email: 'invalid-email',
                    password: '123',
                })
                .expect(400);
        });

        it('should return 409 if login already exists', async () => {
            await request(app.getHttpServer())
                .post('/api/auth/register')
                .send(registerDto)
                .expect(201);

            return request(app.getHttpServer())
                .post('/api/auth/register')
                .send(registerDto)
                .expect(409)
                .expect((res) => {
                    expect(res.body.message).toContain('логин');
                });
        });

        it('should return 409 if email already exists', async () => {
            await request(app.getHttpServer())
                .post('/api/auth/register')
                .send(registerDto)
                .expect(201);

            return request(app.getHttpServer())
                .post('/api/auth/register')
                .send({
                    ...registerDto,
                    login: 'differentuser',
                })
                .expect(409)
                .expect((res) => {
                    expect(res.body.message).toContain('email');
                });
        });
    });

    describe('/api/auth/login (POST)', () => {
        const registerDto = {
            login: 'testuser',
            email: 'test@example.com',
            password: 'password123',
            age: 25,
            about: 'Test user',
        };

        beforeEach(async () => {
            await request(app.getHttpServer())
                .post('/api/auth/register')
                .send(registerDto);
        });

        it('should login with correct credentials', () => {
            return request(app.getHttpServer())
                .post('/api/auth/login')
                .send({
                    login: registerDto.login,
                    password: registerDto.password,
                })
                .expect(200)
                .expect((res) => {
                    expect(res.body).toHaveProperty('user');
                    expect(res.body).toHaveProperty('tokens');
                    expect(res.body.user.login).toBe(registerDto.login);
                    expect(res.body.tokens).toHaveProperty('access');
                    expect(res.body.tokens).toHaveProperty('refresh');
                });
        });

        it('should return 401 with incorrect password', () => {
            return request(app.getHttpServer())
                .post('/api/auth/login')
                .send({
                    login: registerDto.login,
                    password: 'wrongpassword',
                })
                .expect(401);
        });

        it('should return 401 with non-existent login', () => {
            return request(app.getHttpServer())
                .post('/api/auth/login')
                .send({
                    login: 'nonexistent',
                    password: 'password123',
                })
                .expect(401);
        });
    });

    describe('/api/auth/refresh (POST)', () => {
        let refreshToken: string;

        beforeEach(async () => {
            const response = await request(app.getHttpServer())
                .post('/api/auth/register')
                .send({
                    login: 'testuser',
                    email: 'test@example.com',
                    password: 'password123',
                    age: 25,
                    about: 'Test user',
                });

            refreshToken = response.body.tokens.refresh;
        });

        it('should refresh tokens with valid refresh token', () => {
            return request(app.getHttpServer())
                .post('/api/auth/refresh')
                .send({ refreshToken })
                .expect(200)
                .expect((res) => {
                    expect(res.body).toHaveProperty('access');
                    expect(res.body).toHaveProperty('refresh');
                });
        });

        it('should return 401 with invalid refresh token', () => {
            return request(app.getHttpServer())
                .post('/api/auth/refresh')
                .send({ refreshToken: 'invalid_token' })
                .expect(401);
        });
    });
});
