import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { PrismaService } from '../src/prisma/prisma.service';
import { AppModule } from './../src/app.module';

describe('UserController (e2e)', () => {
    let app: INestApplication;
    let prisma: PrismaService;
    let adminToken: string;
    let userId: string;
    let userToken: string;
    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        prisma = moduleFixture.get<PrismaService>(PrismaService);
        await app.init();

        // Get admin token
        const loginResponse = await request(app.getHttpServer())
            .post('/auth/login')
            .send({
                telephone: process.env.DEFAULT_ADMIN_TELEPHONE,
                password: process.env.DEFAULT_ADMIN_PASSWORD,
            });
        adminToken = loginResponse.body.data.token;

        await prisma.cleanDatabase();
    });

    describe('POST /user/create', () => {
        it('should create a new user', async () => {
            const response = await request(app.getHttpServer())
                .post('/user/create')
                .send({
                    firstName: 'Test',
                    lastName: 'User',
                    telephone: '+25070099988',
                    password: 'Test@123',
                })
                .expect(201);

            userId = response.body.data.user.id;
            userToken = response.body.data.token;
            console.log(response.body);
            expect(response.body.data.user.telephone).toBe('+25070099988');
        });
    });

    describe('GET /user/:id', () => {
        it('should get user by id', () => {
            return request(app.getHttpServer())
                .get(`/user/${userId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200)
                .expect((res) => {
                    expect(res.body.data.user.id).toBe(userId);
                });
        });
    });

    describe('GET /user', () => {
        it('should get all users (admin only)', () => {
            return request(app.getHttpServer())
                .get('/user')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200)
                .expect((res) => {
                    expect(Array.isArray(res.body.data.users)).toBeTruthy();
                });
        });

        it('should filter users by type', () => {
            return request(app.getHttpServer())
                .get('/user?userType=END_USER')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200)
                .expect((res) => {
                    expect(Array.isArray(res.body.data.users)).toBeTruthy();
                    res.body.data.users.forEach(user => {
                        expect(user.userType).toBe('END_USER');
                    });
                });
        });
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });
});
