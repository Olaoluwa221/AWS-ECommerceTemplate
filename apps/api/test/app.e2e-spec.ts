import type { INestApplication } from '@nestjs/common';
import type { Connection } from 'mongoose';
import request from 'supertest';
import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
} from 'vitest';

import {
  closeTestApp,
  createTestApp,
} from './helper/app.helper.js';

describe('App (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;

  beforeAll(async () => {
    // Create Nestapp and Mongoose connection
    const context = await createTestApp();

    app = context.app;
    connection = context.connection;

    await app.init();
  });

  afterAll(async () => {
    await closeTestApp(app);
  });

  it('connects to MongoDB', () => {
    expect(connection.readyState).toBe(1);
  });

  it('uses MongoMemoryServer', () => {
    expect(connection.host).toBe('127.0.0.1');
  });

  it('protects the root endpoint when unauthenticated', async () => {
    await request(app.getHttpServer())
      .get('/api')
      .expect(401);
  });
});