import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { LoanStatus, UserType } from '@prisma/client';

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

        // Setup test data in a transaction
        await prismaService.$transaction(async (tx) => {
            // Create regular user
            const user = await tx.user.create({
                data: {
                    firstName: 'John',
                    lastName: 'Doe',
                    telephone: '+250788888888',
                    password: 'Password123!',
                    userType: UserType.END_USER,
                },
            });
            userId = user.id;

            // Create admin user
            await tx.user.create({
                data: {
                    firstName: 'Admin',
                    lastName: 'User',
                    telephone: '+250788888889',
                    password: 'Admin123!',
                    userType: UserType.ADMIN,
                },
            });
        });

        // Get auth tokens
        const userLogin = await request(app.getHttpServer())
            .post('/auth/login')
            .send({
                telephone: '+250788888888',
                password: 'Password123!',
            });
        userAuthToken = userLogin.body.data.token;

        const adminLogin = await request(app.getHttpServer())
            .post('/auth/login')
            .send({
                telephone: '+250788888889',
                password: 'Admin123!',
            });
        adminAuthToken = adminLogin.body.data.token;
    });

    afterAll(async () => {
        await prismaService.$disconnect();
        await app.close();
    });

    describe('POST /loan/create', () => {
        it('should fail when loan amount exceeds 1/3 of monthly income', () => {
            return request(app.getHttpServer())
                .post('/loan/create')
                .set('Authorization', `Bearer ${userAuthToken}`)
                .send({
                    amount: 6000,
                    monthlyIncome: 15000,
                })
                .expect(400)
                .expect((response) => {
                    expect(response.body.message).toContain('must not exceed 1/3');
                });
        });

        it('should create a loan request successfully', () => {
            return request(app.getHttpServer())
                .post('/loan/create')
                .set('Authorization', `Bearer ${userAuthToken}`)
                .send({
                    amount: 4000,
                    monthlyIncome: 15000,
                })
                .expect(201)
                .expect((response) => {
                    expect(response.body.data.loan.status).toBe(LoanStatus.PENDING);
                    loanId = response.body.data.loan.id;
                });
        });

        it('should fail without auth token', () => {
            return request(app.getHttpServer())
                .post('/loan/create')
                .send({
                    amount: 4000,
                    monthlyIncome: 15000,
                })
                .expect(401);
        });
    });

    describe('PATCH /loan/submit/:id', () => {
        it('should submit a loan successfully', () => {
            return request(app.getHttpServer())
                .patch(`/loan/submit/${loanId}`)
                .set('Authorization', `Bearer ${userAuthToken}`)
                .expect(200)
                .expect((response) => {
                    expect(response.body.data.status).toBe(LoanStatus.SUBMITTED);
                });
        });

        it('should fail submitting another user\'s loan', async () => {
            // Create another user's loan in transaction
            const anotherLoan = await prismaService.$transaction(async (tx) => {
                const user = await tx.user.create({
                    data: {
                        firstName: 'Jane',
                        lastName: 'Doe',
                        telephone: '+250788888890',
                        password: 'Password123!',
                        userType: UserType.END_USER,
                    },
                });

                return await tx.loan.create({
                    data: {
                        userId: user.id,
                        amount: 3000,
                        monthlyIncome: 10000,
                        status: LoanStatus.PENDING,
                    },
                });
            });

            return request(app.getHttpServer())
                .patch(`/loan/submit/${anotherLoan.id}`)
                .set('Authorization', `Bearer ${userAuthToken}`)
                .expect(400);
        });
    });

    describe('Admin Loan Operations', () => {
        it('should approve a submitted loan', () => {
            return request(app.getHttpServer())
                .patch(`/loan/approve/${loanId}`)
                .set('Authorization', `Bearer ${adminAuthToken}`)
                .expect(200)
                .expect((response) => {
                    expect(response.body.data.status).toBe(LoanStatus.APPROVED);
                });
        });

        it('should fail approving loan with non-admin user', () => {
            return request(app.getHttpServer())
                .patch(`/loan/approve/${loanId}`)
                .set('Authorization', `Bearer ${userAuthToken}`)
                .expect(403);
        });

        it('should get all loans as admin', () => {
            return request(app.getHttpServer())
                .get('/loan')
                .set('Authorization', `Bearer ${adminAuthToken}`)
                .expect(200)
                .expect((response) => {
                    expect(response.body.data).toHaveProperty('loans');
                    expect(response.body.data).toHaveProperty('meta');
                });
        });

        it('should fail getting all loans as non-admin', () => {
            return request(app.getHttpServer())
                .get('/loan')
                .set('Authorization', `Bearer ${userAuthToken}`)
                .expect(403);
        });
    });
});
