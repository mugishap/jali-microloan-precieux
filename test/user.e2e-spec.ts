import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { UserType } from '@prisma/client';
import { PrismaClient } from '@prisma/client';

describe('UserController (e2e)', () => {
    let app: INestApplication;
    let prismaService: PrismaService;
    let authToken: string;
    let adminAuthToken: string;
    let userId: string;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleRef.createNestApplication();
        prismaService = moduleRef.get<PrismaService>(PrismaService);
        await app.init();
        
        await prismaService.$transaction(async (tx) => {
        });
    });

    afterAll(async () => {
        await prismaService.$disconnect();
        await app.close();
    });

    describe('POST /user/create', () => {
        it('should create a new user', () => {
            return request(app.getHttpServer())
                .post('/user/create')
                .send({
                    firstName: 'John',
                    lastName: 'Doe',
                    telephone: '+250788888888',
                    password: 'Password123!',
                })
                .expect(201)
                .expect((response) => {
                    expect(response.body.data.user.userType).toBe(UserType.END_USER);
                    userId = response.body.data.user.id;
                    authToken = response.body.data.token;
                });
        });

        it('should fail with invalid password format', () => {
            return request(app.getHttpServer())
                .post('/user/create')
                .send({
                    firstName: 'John',
                    lastName: 'Doe',
                    telephone: '+250788888889',
                    password: 'weakpass',
                })
                .expect(400)
                .expect((response) => {
                    expect(response.body.message).toContain('Password must have');
                });
        });
    });

    describe('Admin User Operations', () => {
        beforeAll(async () => {
            // Create an admin user
            const adminResponse = await request(app.getHttpServer())
                .post('/admin/create')
                .send({
                    firstName: 'Admin',
                    lastName: 'User',
                    telephone: '+250788888890',
                    password: 'Admin123!',
                });

            const adminLogin = await request(app.getHttpServer())
                .post('/auth/login')
                .send({
                    telephone: '+250788888890',
                    password: 'Admin123!',
                });

            adminAuthToken = adminLogin.body.data.token;
        });

        it('should get all users as admin', () => {
            return request(app.getHttpServer())
                .get('/user')
                .set('Authorization', `Bearer ${adminAuthToken}`)
                .expect(200)
                .expect((response) => {
                    expect(response.body.data).toHaveProperty('users');
                    expect(response.body.data).toHaveProperty('meta');
                });
        });

        it('should fail getting users with non-admin user', () => {
            return request(app.getHttpServer())
                .get('/user')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(403);
        });

        it('should filter users by type', () => {
            return request(app.getHttpServer())
                .get('/user?userType=END_USER')
                .set('Authorization', `Bearer ${adminAuthToken}`)
                .expect(200)
                .expect((response) => {
                    expect(response.body.data.users).toEqual(
                        expect.arrayContaining([
                            expect.objectContaining({
                                userType: 'END_USER',
                            }),
                        ]),
                    );
                });
        });
    });
}); 