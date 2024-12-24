import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { hash } from 'bcrypt';

describe('AuthController (e2e)', () => {
    let app: INestApplication;
    let prisma: PrismaService;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        prisma = moduleFixture.get<PrismaService>(PrismaService);
        await app.init();
        await prisma.cleanDatabase();
    });

    describe('POST /auth/login', () => {
        it('should login admin successfully', () => {
            return request(app.getHttpServer())
                .post('/auth/login')
                .send({
                    telephone: process.env.DEFAULT_ADMIN_TELEPHONE,
                    password: process.env.DEFAULT_ADMIN_PASSWORD,
                })
                .expect(200)
                .expect((res) => {
                    expect(res.body.data.token).toBeDefined();
                    expect(res.body.data.user.userType).toBe('ADMIN');
                });
        });

        it('should login normal user successfully', async () => {
            // Create test user first
            const password = await hash('Test@123', 10);
            await prisma.user.create({
                data: {
                    firstName: 'Test',
                    lastName: 'User',
                    telephone: '+25070099988',
                    password,
                    userType: 'END_USER',
                },
            });

            return request(app.getHttpServer())
                .post('/auth/login')
                .send({
                    telephone: '+25070099988',
                    password: 'Test@123',
                })
                .expect(200)
                .expect((res) => {
                    expect(res.body.data.token).toBeDefined();
                    expect(res.body.data.user.userType).toBe('END_USER');
                });
        });
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });
});