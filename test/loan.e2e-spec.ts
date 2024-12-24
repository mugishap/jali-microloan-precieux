import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { LoanStatus } from '@prisma/client';

describe('LoanController (e2e)', () => {
    let app: INestApplication;
    let prismaService: PrismaService;
    let userAuthToken: string;
    let adminAuthToken: string;
    let userId: string;
    let loanId: string;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleRef.createNestApplication();
        prismaService = moduleRef.get<PrismaService>(PrismaService);
        await app.init();

        // Create a regular user
        const userResponse = await request(app.getHttpServer())
            .post('/user/create')
            .send({
                firstName: 'John',
                lastName: 'Doe',
                telephone: '+250788888888',
                password: 'password123',
            });

        userId = userResponse.body.data.user.id;

        // Login as user
        const loginResponse = await request(app.getHttpServer())
            .post('/auth/login')
            .send({
                telephone: '+250788888888',
                password: 'password123',
            });

        userAuthToken = loginResponse.body.data.token;
    });

    afterAll(async () => {
        await prismaService.cleanDatabase();
        await app.close();
    });

    describe('POST /loan/request', () => {
        it('should create a loan request', () => {
            return request(app.getHttpServer())
                .post('/loan/request')
                .set('Authorization', `Bearer ${userAuthToken}`)
                .send({
                    amount: 5000,
                    monthlyIncome: 10000,
                })
                .expect(201)
                .expect((response) => {
                    expect(response.body.data).toHaveProperty('loan');
                    expect(response.body.data.loan.amount).toBe(5000);
                    expect(response.body.data.loan.monthlyIncome).toBe(10000);
                    expect(response.body.data.loan.status).toBe(LoanStatus.PENDING);
                    expect(response.body.data.loan.userId).toBe(userId);
                    loanId = response.body.data.loan.id;
                });
        });

        it('should fail with invalid amount', () => {
            return request(app.getHttpServer())
                .post('/loan/request')
                .set('Authorization', `Bearer ${userAuthToken}`)
                .send({
                    amount: -1000,
                    monthlyIncome: 10000,
                })
                .expect(400)
                .expect((response) => {
                    expect(response.body.message).toContain('amount');
                });
        });

        it('should fail without auth token', () => {
            return request(app.getHttpServer())
                .post('/loan/request')
                .send({
                    amount: 5000,
                    monthlyIncome: 10000,
                })
                .expect(401);
        });
    });

    describe('GET /loan/user', () => {
        it('should get user\'s loans', () => {
            return request(app.getHttpServer())
                .get('/loan/user')
                .set('Authorization', `Bearer ${userAuthToken}`)
                .expect(200)
                .expect((response) => {
                    expect(Array.isArray(response.body.data.loans)).toBe(true);
                    expect(response.body.data.loans[0]).toHaveProperty('id');
                    expect(response.body.data.loans[0].userId).toBe(userId);
                });
        });

        it('should fail without auth token', () => {
            return request(app.getHttpServer())
                .get('/loan/user')
                .expect(401);
        });
    });

    describe('GET /loan/:id', () => {
        it('should get loan by id', () => {
            return request(app.getHttpServer())
                .get(`/loan/${loanId}`)
                .set('Authorization', `Bearer ${userAuthToken}`)
                .expect(200)
                .expect((response) => {
                    expect(response.body.data.loan.id).toBe(loanId);
                    expect(response.body.data.loan.userId).toBe(userId);
                });
        });

        it('should fail with invalid loan id', () => {
            return request(app.getHttpServer())
                .get('/loan/invalid-id')
                .set('Authorization', `Bearer ${userAuthToken}`)
                .expect(404)
                .expect((response) => {
                    expect(response.body.message).toBe('Loan not found');
                });
        });

        it('should fail accessing another user\'s loan', async () => {
            // Create another user and their loan
            const anotherUserResponse = await request(app.getHttpServer())
                .post('/user/create')
                .send({
                    firstName: 'Jane',
                    lastName: 'Doe',
                    telephone: '+250788888889',
                    password: 'password123',
                });

            const anotherUserLogin = await request(app.getHttpServer())
                .post('/auth/login')
                .send({
                    telephone: '+250788888889',
                    password: 'password123',
                });

            const anotherUserToken = anotherUserLogin.body.data.token;

            // Create loan for another user
            const anotherLoanResponse = await request(app.getHttpServer())
                .post('/loan/request')
                .set('Authorization', `Bearer ${anotherUserToken}`)
                .send({
                    amount: 3000,
                    monthlyIncome: 8000,
                });

            // Try to access another user's loan
            return request(app.getHttpServer())
                .get(`/loan/${anotherLoanResponse.body.data.loan.id}`)
                .set('Authorization', `Bearer ${userAuthToken}`)
                .expect(403);
        });
    });

    describe('GET /loan/all', () => {
        it('should fail for non-admin users', () => {
            return request(app.getHttpServer())
                .get('/loan/all')
                .set('Authorization', `Bearer ${userAuthToken}`)
                .expect(403);
        });
    });

    describe('PATCH /loan/:id/status', () => {
        it('should fail updating loan status as non-admin', () => {
            return request(app.getHttpServer())
                .patch(`/loan/${loanId}/status`)
                .set('Authorization', `Bearer ${userAuthToken}`)
                .send({
                    status: LoanStatus.APPROVED,
                })
                .expect(403);
        });
    });
});
