import 'dotenv/config';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';
import { PrismaService } from '../src/prisma/prisma.service.js';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  let prisma: PrismaService;

  const testParentEmail = `parent_${Date.now()}@example.com`;
  const testChildEmail = `child_${Date.now()}@example.com`;
  const testPassword = 'Password123!';
  let parentCode = '';
  let parentToken = '';
  let childToken = '';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();

    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    // Clean up test users
    try {
      await prisma.user.deleteMany({
        where: {
          email: {
            in: [testParentEmail, testChildEmail],
          },
        },
      });
    } catch {
      // Ignore cleanup errors
    }
    await app.close();
  });

  describe('Parent Registration', () => {
    it('should register a new parent and return parentCode and accessToken', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register/parent')
        .send({
          email: testParentEmail,
          password: testPassword,
          name: 'Parent User',
        })
        .expect(201);



      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(testParentEmail);
      expect(response.body.user.role).toBe('PARENT');
      expect(response.body.user.parentCode).toBeDefined();
      expect(response.body.user.parentCode.length).toBe(8);

      parentCode = response.body.user.parentCode;
      parentToken = response.body.accessToken;
    });

    it('should reject registration if email is already taken', async () => {
      await request(app.getHttpServer())
        .post('/auth/register/parent')
        .send({
          email: testParentEmail,
          password: testPassword,
          name: 'Duplicate Parent',
        })
        .expect(409);
    });
  });

  describe('Child Registration', () => {
    it('should fail if parentCode does not exist', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register/child')
        .send({
          email: testChildEmail,
          password: testPassword,
          name: 'Child User',
          parentCode: 'INVALID8',
        })
        .expect(400);

      expect(response.body.message).toContain('Invalid parent code');
    });

    it('should successfully register child when parentCode is valid', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register/child')
        .send({
          email: testChildEmail,
          password: testPassword,
          name: 'Child User',
          parentCode,
        })
        .expect(201);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body.user.email).toBe(testChildEmail);
      expect(response.body.user.role).toBe('CHILD');
      expect(response.body.user.parentId).toBeDefined();

      childToken = response.body.accessToken;
    });
  });

  describe('Login', () => {
    it('should login parent with valid credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testParentEmail,
          password: testPassword,
        })
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body.user.role).toBe('PARENT');
    });

    it('should login child with valid credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testChildEmail,
          password: testPassword,
        })
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body.user.role).toBe('CHILD');
    });

    it('should reject invalid password with 401', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testParentEmail,
          password: 'WrongPassword!',
        })
        .expect(401);
    });
  });

  describe('Protected Profile (/auth/me)', () => {
    it('should return parent profile when Bearer token is provided', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${parentToken}`)
        .expect(200);

      expect(response.body.email).toBe(testParentEmail);
      expect(response.body.role).toBe('PARENT');
      expect(response.body.parentCode).toBe(parentCode);
    });

    it('should return child profile when Bearer token is provided', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${childToken}`)
        .expect(200);

      expect(response.body.email).toBe(testChildEmail);
      expect(response.body.role).toBe('CHILD');
      expect(response.body.parentId).toBeDefined();
    });

    it('should reject unauthenticated request with 401', async () => {
      await request(app.getHttpServer())
        .get('/auth/me')
        .expect(401);
    });
  });
});
