import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('AuthController (e2e)', () => {
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

  describe('POST /auth/login', () => {
    beforeAll(async () => {
      // Create a test user for login tests
      await request(app.getHttpServer())
        .post('/user/create')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          telephone: '+250788888888',
          password: 'password123',
        });
    });

    it('should login successfully with valid credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          telephone: '+250788888888',
          password: 'password123',
        })
        .expect(200)
        .expect((response) => {
          expect(response.body.data).toHaveProperty('token');
          expect(response.body.data).toHaveProperty('user');
          expect(response.body.data.user.telephone).toBe('+250788888888');
        });
    });

    it('should fail with invalid password', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          telephone: '+250788888888',
          password: 'wrongpassword',
        })
        .expect(401)
        .expect((response) => {
          expect(response.body.message).toBe('Invalid credentials');
        });
    });

    it('should fail with non-existent telephone', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          telephone: '+250700000000',
          password: 'password123',
        })
        .expect(404)
        .expect((response) => {
          expect(response.body.message).toBe('User not found');
        });
    });

    it('should fail with invalid telephone format', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          telephone: 'invalid-phone',
          password: 'password123',
        })
        .expect(400)
        .expect((response) => {
          expect(response.body.message).toContain('telephone');
        });
    });
  });

  describe('GET /auth/profile', () => {
    let authToken: string;

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

    it('should get user profile with valid token', () => {
      return request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((response) => {
          expect(response.body.data).toHaveProperty('user');
          expect(response.body.data.user.telephone).toBe('+250788888888');
        });
    });

    it('should fail without auth token', () => {
      return request(app.getHttpServer())
        .get('/auth/profile')
        .expect(401);
    });

    it('should fail with invalid auth token', () => {
      return request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });
});
