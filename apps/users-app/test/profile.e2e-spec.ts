import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/contexts/identity/infrastructure/prisma/prisma.service';

describe('ProfileController (e2e)', () => {
    let app: INestApplication;
    let prisma: PrismaService;
    let accessToken: string;
    let userId: string;

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

        const response = await request(app.getHttpServer())
            .post('/api/auth/register')
            .send({
                login: 'testuser',
                email: 'test@example.com',
                password: 'password123',
                age: 25,
                about: 'Test user',
            });

        accessToken = response.body.tokens.access;
        userId = response.body.user.id;
    });

    describe('/api/profile/my (GET)', () => {
        it('should return current user profile', () => {
            return request(app.getHttpServer())
                .get('/api/profile/my')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200)
                .expect((res) => {
                    expect(res.body.id).toBe(userId);
                    expect(res.body.login).toBe('testuser');
                    expect(res.body.email).toBe('test@example.com');
                    expect(res.body.age).toBe(25);
                    expect(res.body).not.toHaveProperty('passwordHash');
                });
        });

        it('should return 401 without token', () => {
            return request(app.getHttpServer())
                .get('/api/profile/my')
                .expect(401);
        });

        it('should return 401 with invalid token', () => {
            return request(app.getHttpServer())
                .get('/api/profile/my')
                .set('Authorization', 'Bearer invalid_token')
                .expect(401);
        });
    });

    describe('/api/profile (PATCH)', () => {
        it('should update user profile', () => {
            return request(app.getHttpServer())
                .patch('/api/profile')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    age: 26,
                    about: 'Updated description',
                })
                .expect(200)
                .expect((res) => {
                    expect(res.body.age).toBe(26);
                    expect(res.body.about).toBe('Updated description');
                    expect(res.body.login).toBe('testuser');
                });
        });

        it('should return 401 without token', () => {
            return request(app.getHttpServer())
                .patch('/api/profile')
                .send({ age: 26 })
                .expect(401);
        });

        it('should return 400 with invalid data', () => {
            return request(app.getHttpServer())
                .patch('/api/profile')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    age: 200,
                })
                .expect(400);
        });
    });

    describe('/api/profile (DELETE)', () => {
        it('should soft delete user profile', async () => {
            await request(app.getHttpServer())
                .delete('/api/profile')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);

            const user = await prisma.user.findUnique({
                where: { id: userId },
            });

            expect(user).toBeTruthy();
            expect(user!.deletedAt).toBeTruthy();
        });

        it('should not allow login after soft delete', async () => {
            await request(app.getHttpServer())
                .delete('/api/profile')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);

            return request(app.getHttpServer())
                .post('/api/auth/login')
                .send({
                    login: 'testuser',
                    password: 'password123',
                })
                .expect(401);
        });

        it('should return 401 without token', () => {
            return request(app.getHttpServer())
                .delete('/api/profile')
                .expect(401);
        });
    });
});
