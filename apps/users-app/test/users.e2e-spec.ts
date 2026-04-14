import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/contexts/identity/infrastructure/prisma/prisma.service';

describe('UsersController (e2e)', () => {
    let app: INestApplication;
    let prisma: PrismaService;
    let accessToken: string;

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

        const users = [
            {
                login: 'user1',
                email: 'user1@example.com',
                password: 'password123',
                age: 25,
                about: 'First user',
            },
            {
                login: 'user2',
                email: 'user2@example.com',
                password: 'password123',
                age: 30,
                about: 'Second user',
            },
            {
                login: 'testuser',
                email: 'test@example.com',
                password: 'password123',
                age: 35,
                about: 'Test user',
            },
        ];

        for (const user of users) {
            await request(app.getHttpServer())
                .post('/api/auth/register')
                .send(user);
        }

        const response = await request(app.getHttpServer())
            .post('/api/auth/login')
            .send({
                login: 'testuser',
                password: 'password123',
            });

        accessToken = response.body.tokens.access;
    });

    describe('/api/users (GET)', () => {
        it('should return paginated list of users', () => {
            return request(app.getHttpServer())
                .get('/api/users')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200)
                .expect((res) => {
                    expect(res.body).toHaveProperty('items');
                    expect(res.body).toHaveProperty('total');
                    expect(res.body).toHaveProperty('page');
                    expect(res.body).toHaveProperty('limit');
                    expect(res.body.items).toBeInstanceOf(Array);
                    expect(res.body.total).toBe(3);
                    expect(res.body.items.length).toBe(3);
                });
        });

        it('should return users with pagination', () => {
            return request(app.getHttpServer())
                .get('/api/users?page=1&limit=2')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200)
                .expect((res) => {
                    expect(res.body.items.length).toBe(2);
                    expect(res.body.total).toBe(3);
                    expect(res.body.page).toBe(1);
                    expect(res.body.limit).toBe(2);
                });
        });

        it('should search users by login', () => {
            return request(app.getHttpServer())
                .get('/api/users?q=user1')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200)
                .expect((res) => {
                    expect(res.body.items.length).toBe(1);
                    expect(res.body.items[0].login).toBe('user1');
                });
        });

        it('should search users with partial match', () => {
            return request(app.getHttpServer())
                .get('/api/users?q=user')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200)
                .expect((res) => {
                    expect(res.body.items.length).toBeGreaterThanOrEqual(2);
                    expect(res.body.items.some((u: any) => u.login.includes('user'))).toBe(true);
                });
        });

        it('should return empty array if no users match search', () => {
            return request(app.getHttpServer())
                .get('/api/users?q=nonexistent')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200)
                .expect((res) => {
                    expect(res.body.items.length).toBe(0);
                    expect(res.body.total).toBe(0);
                });
        });

        it('should return 401 without token', () => {
            return request(app.getHttpServer())
                .get('/api/users')
                .expect(401);
        });

        it('should not include passwordHash in response', () => {
            return request(app.getHttpServer())
                .get('/api/users')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200)
                .expect((res) => {
                    res.body.items.forEach((user: any) => {
                        expect(user).not.toHaveProperty('passwordHash');
                        expect(user).not.toHaveProperty('currentHashedRt');
                    });
                });
        });
    });
});
