import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { UserType } from '@prisma/client';

describe('UserController (e2e)', () => {
    let app: INestApplication;
    let prismaService: PrismaService;
    let authToken: string;
    let userId: string;

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
                    telephone: '+250788888888',
                    password: 'password123',
                })
                .expect(201)
                .expect((response) => {
                    expect(response.body.data).toHaveProperty('user');
                    expect(response.body.data.user.firstName).toBe('John');
                    expect(response.body.data.user.lastName).toBe('Doe');
                    expect(response.body.data.user.telephone).toBe('+250788888888');
                    expect(response.body.data.user.userType).toBe(UserType.END_USER);
                    userId = response.body.data.user.id;
                });
        });

        it('should fail creating user with existing telephone', () => {
            return request(app.getHttpServer())
                .post('/user/create')
                .send({
                    firstName: 'Jane',
                    lastName: 'Doe',
                    telephone: '+250788888888',
                    password: 'password123',
                })
                .expect(400)
                .expect((response) => {
                    expect(response.body.message).toContain('telephone already exists');
                });
        });

        it('should fail with invalid telephone format', () => {
            return request(app.getHttpServer())
                .post('/user/create')
                .send({
                    firstName: 'Jane',
                    lastName: 'Doe',
                    telephone: 'invalid-phone',
                    password: 'password123',
                })
                .expect(400)
                .expect((response) => {
                    expect(response.body.message).toContain('telephone');
                });
        });
    });

    describe('Protected Routes', () => {
        beforeAll(async () => {
            // Login to get auth token
            const response = await request(app.getHttpServer())
                .post('/auth/login')
                .send({
                    telephone: '+250788888888',
                    password: 'password123',
                });
            
            authToken = response.body.data.token;
        });

        describe('GET /user/:id', () => {
            it('should get user by id', () => {
                return request(app.getHttpServer())
                    .get(`/user/${userId}`)
                    .set('Authorization', `Bearer ${authToken}`)
                    .expect(200)
                    .expect((response) => {
                        expect(response.body.data).toHaveProperty('user');
                        expect(response.body.data.user.id).toBe(userId);
                        expect(response.body.data.user.telephone).toBe('+250788888888');
                    });
            });

            it('should fail with invalid user id', () => {
                return request(app.getHttpServer())
                    .get('/user/invalid-id')
                    .set('Authorization', `Bearer ${authToken}`)
                    .expect(404)
                    .expect((response) => {
                        expect(response.body.message).toBe('User not found');
                    });
            });

            it('should fail without auth token', () => {
                return request(app.getHttpServer())
                    .get(`/user/${userId}`)
                    .expect(401);
            });
        });

        describe('PATCH /user/:id', () => {
            it('should update user details', () => {
                return request(app.getHttpServer())
                    .patch(`/user/${userId}`)
                    .set('Authorization', `Bearer ${authToken}`)
                    .send({
                        firstName: 'Johnny',
                        lastName: 'Updated',
                    })
                    .expect(200)
                    .expect((response) => {
                        expect(response.body.data.user.firstName).toBe('Johnny');
                        expect(response.body.data.user.lastName).toBe('Updated');
                        expect(response.body.data.user.telephone).toBe('+250788888888');
                    });
            });

            it('should fail updating another user\'s details', async () => {
                // Create another user
                const anotherUser = await request(app.getHttpServer())
                    .post('/user/create')
                    .send({
                        firstName: 'Another',
                        lastName: 'User',
                        telephone: '+250788888889',
                        password: 'password123',
                    });

                return request(app.getHttpServer())
                    .patch(`/user/${anotherUser.body.data.user.id}`)
                    .set('Authorization', `Bearer ${authToken}`)
                    .send({
                        firstName: 'Hacked',
                    })
                    .expect(403);
            });

            it('should fail without auth token', () => {
                return request(app.getHttpServer())
                    .patch(`/user/${userId}`)
                    .send({
                        firstName: 'Johnny',
                    })
                    .expect(401);
            });
        });

        describe('GET /user/all', () => {
            it('should fail for non-admin users', () => {
                return request(app.getHttpServer())
                    .get('/user/all')
                    .set('Authorization', `Bearer ${authToken}`)
                    .expect(403);
            });

            // Add admin user test if needed
            // Would require creating an admin user first
        });
    });
}); 