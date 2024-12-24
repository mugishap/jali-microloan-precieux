import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { hash } from 'bcrypt';

describe('LoanController (e2e)', () => {
    let app: INestApplication;
    let prisma: PrismaService;
    let adminToken: string;
    let userToken: string;
    let loanId: string;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        prisma = moduleFixture.get<PrismaService>(PrismaService);
        await app.init();

        // Create test user
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

        // Get admin token
        const adminLoginResponse = await request(app.getHttpServer())
            .post('/auth/login')
            .send({
                telephone: process.env.DEFAULT_ADMIN_TELEPHONE,
                password: process.env.DEFAULT_ADMIN_PASSWORD,
            });
        adminToken = adminLoginResponse.body.data.token;

        // Get user token
        const userLoginResponse = await request(app.getHttpServer())
            .post('/auth/login')
            .send({
                telephone: '+25070099988',
                password: 'Test@123',
            });
        userToken = userLoginResponse.body.data.token;

        await prisma.cleanDatabase(); // Clean database before tests
    });

    describe('POST /loan/create', () => {
        it('should create a new loan', async () => {
            const response = await request(app.getHttpServer())
                .post('/loan/create')
                .set('Authorization', `Bearer ${userToken}`)
                .send({
                    amount: 1000,
                    purpose: 'Test loan',
                })
                .expect(200);

            loanId = response.body.data.loan.id;
            expect(response.body.data.loan.status).toBe('DRAFT');
        });
    });

    describe('PATCH /loan/submit/:id', () => {
        it('should submit a loan', () => {
            return request(app.getHttpServer())
                .patch(`/loan/submit/${loanId}`)
                .set('Authorization', `Bearer ${userToken}`)
                .expect(200)
                .expect((res) => {
                    expect(res.body.data.status).toBe('PENDING');
                });
        });
    });

    describe('PATCH /loan/approve/:id', () => {
        it('should approve a loan', () => {
            return request(app.getHttpServer())
                .patch(`/loan/approve/${loanId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200)
                .expect((res) => {
                    expect(res.body.data.status).toBe('APPROVED');
                });
        });
    });

    describe('GET /loan', () => {
        it('should get all loans (admin only)', () => {
            return request(app.getHttpServer())
                .get('/loan')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200)
                .expect((res) => {
                    expect(Array.isArray(res.body.data.loans.items)).toBeTruthy();
                });
        });
    });

    describe('GET /loan/:id', () => {
        it('should get loan by id', () => {
            return request(app.getHttpServer())
                .get(`/loan/${loanId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200)
                .expect((res) => {
                    expect(res.body.data.loan.id).toBe(loanId);
                });
        });
    });

    describe('DELETE /loan/:id', () => {
        it('should delete a loan', () => {
            return request(app.getHttpServer())
                .delete(`/loan/${loanId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);
        });
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });
});

