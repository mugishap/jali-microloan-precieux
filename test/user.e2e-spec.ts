import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('UserController (e2e)', () => {
    let app: INestApplication;
    let prismaService: PrismaService;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleRef.createNestApplication();
        prismaService = moduleRef.get<PrismaService>(PrismaService);
        await app.init();
    });

    afterAll(async () => {
        await prismaService.cleanDatabase();
        await app.close();
    });

    describe('POST /user/create', () => {
        it('should create a new user', () => {
            return request(app.getHttpServer())
                .post('/user/create')
                .send({
                    firstName: 'John',
                    lastName: 'Doe',
                    telephone: '+250799999999',
                    password: 'password123',
                })
                .expect(201)
                .expect((response) => {
                    expect(response.body.data).toHaveProperty('user');
                    expect(response.body.data.user.firstName).toBe('John');
                    expect(response.body.data.user.lastName).toBe('Doe');
                    expect(response.body.data.user.telephone).toBe('+250799999999');
                });
        });
    });
}); 