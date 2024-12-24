import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('AuthController (e2e)', () => {
    let app: INestApplication;
    let prismaService: PrismaService;
    let authToken: string;

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
    describe('POST /auth/login', () => {
        it('should login successfully with valid credentials', () => {
            return request(app.getHttpServer())
                .post('/auth/login')
                .send({
                    telephone: '+250788888888',
                    password: 'Password123!',
                })
                .expect(200)
                .expect((response) => {
                    expect(response.body.data).toHaveProperty('token');
                    expect(response.body.data).toHaveProperty('user');
                    expect(response.body.data.user.telephone).toBe('+250788888888');
                    authToken = response.body.data.token;
                });
        });

        it('should fail with invalid telephone format', () => {
            return request(app.getHttpServer())
                .post('/auth/login')
                .send({
                    telephone: 'invalid-phone',
                    password: 'Password123!',
                })
                .expect(401)
                .expect((response) => {
                    expect(response.body.message).toContain('telephone');
                });
        });

        it('should fail with missing credentials', () => {
            return request(app.getHttpServer())
                .post('/auth/login')
                .send({})
                .expect(400)
                .expect((response) => {
                    expect(response.body.message).toContain('telephone');
                    expect(response.body.message).toContain('password');
                });
        });
    });
});
