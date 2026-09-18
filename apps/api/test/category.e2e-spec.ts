import type { INestApplication } from '@nestjs/common';
import { Types, type Connection } from 'mongoose';
import request from 'supertest';
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from 'vitest';

import {
  closeTestApp,
  createTestApp,
} from './helper/app.helper.js';

import {
  createTestAuthAgents,
  TestAgent,
} from './helper/auth.helper.js';
import { testRoutes } from './helper/test-routes.helper.js';

// Category testing group
describe('Categories (e2e)', () => {

  let app: INestApplication;
  let connection: Connection;

  let adminAgent: TestAgent;
  let customerAgent: TestAgent;

  async function createCategory(
    data: {
      name: string;
      description?: string;
      parentCategory?: string;
    },
  ) {
    const response = await adminAgent
      .post(testRoutes.categories.root)
      .send(data)
      .expect(201);

    return response.body;
  }
  // Sets up a fresh Nest application before any tests run.
  beforeAll(async () => {
    // Create Nest + MongoMemoryServer.
    const context = await createTestApp();

    app = context.app;
    connection = context.connection;

    // Register/login customer and admin agents.
    const agents = await createTestAuthAgents(app);

    adminAgent = agents.adminAgent;
    customerAgent = agents.customerAgent;
  });

  //Cleat categories collection
  beforeEach(async () => {
    await connection
      .collection('categories')
      .deleteMany({});
  });

  // Closes the app after the suite is complete.
  afterAll(async () => {
    await closeTestApp(app);
  });

  // POST /categories endpoint Testing.
  describe('POST /api/categories', () => {
    it('returns 401 when unauthenticated', async () => {
      await request(app.getHttpServer())
        .post(testRoutes.categories.root)
        .send({
          name: 'clothing',
          displayName: 'Clothing',
        })
        .expect(401);
    });

    it('returns 403 for a customer', async () => {
      await customerAgent
        .post(testRoutes.categories.root)
        .send({
          name: 'clothing',
          displayName: 'Clothing',
        })
        .expect(403);
    });

    it('creates a category as an admin', async () => {
      const response = await adminAgent
        .post(testRoutes.categories.root)
        .send({
          name: 'Clothing',
          description: 'Clothing Parent Category'
        })
        .expect(201);

      expect(response.body.name).toBe('Clothing');
      expect(response.body.slug).toBe('clothing');
      expect(response.body._id).toBeDefined();
    });

    it('rejects an invalid DTO', async () => {
      await adminAgent
        .post(testRoutes.categories.root)
        .send({
          unexpectedField: 'not allowed',
        })
        .expect(400);
    });
  });

  // GET /categories endpoint Testing.
  describe('GET /api/categories', () => {
    it('is publicly accessible', async () => {
      await request(app.getHttpServer())
        .get(testRoutes.categories.root)
        .expect(200);
    });

    it('returns active categories', async () => {
      await createCategory({
        name: 'Clothing',
      });

      await createCategory({
        name: 'Electronics',
      });

      const response = await request(app.getHttpServer())
        .get(testRoutes.categories.root)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);

      expect(
        response.body.some(
          (category: { name: string }) =>
            category.name === 'Clothing',
        ),
      ).toBe(true);

      expect(
        response.body.some(
          (category: { name: string }) =>
            category.name === 'Electronics',
        ),
      ).toBe(true);
    });

    it('does not return deactivated categories', async () => {
      const category = await createCategory({
        name: 'Clothing',
      });

      await adminAgent
        .patch(
          testRoutes.categories.deactivate(
            category._id,
          ),
        )
        .expect(200);

      const response = await request(app.getHttpServer())
        .get(testRoutes.categories.root)
        .expect(200);

      expect(
        response.body.some(
          (item: { _id: string }) =>
            item._id === category._id,
        ),
      ).toBe(false);
    });
  });

  // GET /categories/admin/all endpoint Testing.
  describe('GET /api/categories/admin/all', () => {
    it('returns 401 when unauthenticated', async () => {
      await request(app.getHttpServer())
        .get(testRoutes.categories.adminAll)
        .expect(401);
    });

    it('returns 403 for a customer', async () => {
      await customerAgent
        .get(testRoutes.categories.adminAll)
        .expect(403);
    });

    it('returns active and inactive categories for an admin', async () => {
      const activeCategory = await createCategory({
        name: 'Clothing',
      });

      const inactiveCategory = await createCategory({
        name: 'Electronics',
      });

      await adminAgent
        .patch(
          testRoutes.categories.deactivate(
            inactiveCategory._id,
          ),
        )
        .expect(200);

      const response = await adminAgent
        .get(testRoutes.categories.adminAll)
        .expect(200);

      const active = response.body.find(
        (category: { _id: string }) =>
          category._id === activeCategory._id,
      );

      const inactive = response.body.find(
        (category: { _id: string }) =>
          category._id === inactiveCategory._id,
      );

      expect(active).toBeDefined();
      expect(inactive).toBeDefined();

      expect(active.isActive).toBe(true);
      expect(inactive.isActive).toBe(false);
    });
  });

  // GET /categories/:slug endpoint Testing.
  describe('GET /api/categories/:slug', () => {
    it('returns a category by slug', async () => {
      const category = await createCategory({
        name: 'Clothing',
        description: 'All clothing products',
      });

      const response = await request(app.getHttpServer())
        .get(
          testRoutes.categories.bySlug(
            category.slug,
          ),
        )
        .expect(200);

      expect(response.body._id).toBe(category._id);
      expect(response.body.name).toBe('Clothing');
      expect(response.body.slug).toBe(category.slug);
      expect(response.body.description)
        .toBe('All clothing products');
    });

    it('returns 404 for a slug that does not exist', async () => {
      await request(app.getHttpServer())
        .get(
          testRoutes.categories.bySlug(
            'does-not-exist',
          ),
        )
        .expect(404);
    });
  });

  // PATCH /categories/:id endpoint testing
  describe('PATCH /api/categories/:id', () => {
    it('returns 401 when unauthenticated', async () => {
      const id = new Types.ObjectId().toString();

      await request(app.getHttpServer())
        .patch(
          testRoutes.categories.byId(id),
        )
        .send({
          name: 'Updated',
        })
        .expect(401);
    });

    it('returns 403 for a customer', async () => {
      const id = new Types.ObjectId().toString();

      await customerAgent
        .patch(
          testRoutes.categories.byId(id),
        )
        .send({
          name: 'Updated',
        })
        .expect(403);
    });

    it('updates the category description', async () => {
      const category = await createCategory({
        name: 'Clothing',
        description: 'Old description',
      });

      await adminAgent
        .patch(
          testRoutes.categories.byId(
            category._id,
          ),
        )
        .send({
          description: 'New description',
        })
        .expect(200);

      const response = await request(app.getHttpServer())
        .get(
          testRoutes.categories.bySlug(
            category.slug,
          ),
        )
        .expect(200);

      expect(response.body.description)
        .toBe('New description');
    });

    it('updates the name of a category', async () => {
      const category = await createCategory({
        name: 'Clothing',
      });

      const response = await adminAgent
        .patch(
          testRoutes.categories.byId(
            category._id,
          ),
        )
        .send({
          name: 'Mens Clothing',
        })
        .expect(200);

      expect(response.body.name)
        .toBe('Mens Clothing');
    });

    it('rejects parentCategory as an update field', async () => {
      const parent = await createCategory({
        name: 'Clothing',
      });

      const child = await createCategory({
        name: 'Shirts',
      });

      await adminAgent
        .patch(
          testRoutes.categories.byId(
            child._id,
          ),
        )
        .send({
          parentCategory: parent._id,
        })
        .expect(400);
    });

    it('returns 404 when the category does not exist', async () => {
      const missingId =
        new Types.ObjectId().toString();

      await adminAgent
        .patch(
          testRoutes.categories.byId(
            missingId,
          ),
        )
        .send({
          name: 'Does Not Exist',
        })
        .expect(404);
    });
  });

  // PATCH /categories/:id/deactivate endpoint testing
  describe('PATCH /api/categories/:id/deactivate', () => {
    it('returns 401 when unauthenticated', async () => {
      const id = new Types.ObjectId().toString();

      await request(app.getHttpServer())
        .patch(
          testRoutes.categories.deactivate(id),
        )
        .expect(401);
    });

    it('returns 403 for a customer', async () => {
      const category = await createCategory({
        name: 'Clothing',
      });

      await customerAgent
        .patch(
          testRoutes.categories.deactivate(
            category._id,
          ),
        )
        .expect(403);
    });

    it('deactivates a category as an admin', async () => {
      const category = await createCategory({
        name: 'Clothing',
      });

      await adminAgent
        .patch(
          testRoutes.categories.deactivate(
            category._id,
          ),
        )
        .expect(200);

      const response = await adminAgent
        .get(testRoutes.categories.adminAll)
        .expect(200);

      const deactivated = response.body.find(
        (item: { _id: string }) =>
          item._id === category._id,
      );

      expect(deactivated).toBeDefined();
      expect(deactivated.isActive).toBe(false);
    });

    it('removes a deactivated category from the public list', async () => {
      const category = await createCategory({
        name: 'Clothing',
      });

      await adminAgent
        .patch(
          testRoutes.categories.deactivate(
            category._id,
          ),
        )
        .expect(200);

      const response = await request(app.getHttpServer())
        .get(testRoutes.categories.root)
        .expect(200);

      expect(
        response.body.some(
          (item: { _id: string }) =>
            item._id === category._id,
        ),
      ).toBe(false);
    });

    it('returns 404 when the category does not exist', async () => {
      const missingId =
        new Types.ObjectId().toString();

      await adminAgent
        .patch(
          testRoutes.categories.deactivate(
            missingId,
          ),
        )
        .expect(404);
    });
  });

  // PATCH /categories/:id/reactivate endpoint testing
  describe('PATCH /api/categories/:id/reactivate', () => {
    it('returns 401 when unauthenticated', async () => {
      const id = new Types.ObjectId().toString();

      await request(app.getHttpServer())
        .patch(
          testRoutes.categories.reactivate(id),
        )
        .expect(401);
    });

    it('returns 403 for a customer', async () => {
      const category = await createCategory({
        name: 'Clothing',
      });

      await customerAgent
        .patch(
          testRoutes.categories.reactivate(
            category._id,
          ),
        )
        .expect(403);
    });

    it('reactivates a deactivated category as an admin', async () => {
      const category = await createCategory({
        name: 'Clothing',
      });

      await adminAgent
        .patch(
          testRoutes.categories.deactivate(
            category._id,
          ),
        )
        .expect(200);

      await adminAgent
        .patch(
          testRoutes.categories.reactivate(
            category._id,
          ),
        )
        .expect(200);

      const response = await adminAgent
        .get(testRoutes.categories.adminAll)
        .expect(200);

      const reactivated = response.body.find(
        (item: { _id: string }) =>
          item._id === category._id,
      );

      expect(reactivated).toBeDefined();
      expect(reactivated.isActive).toBe(true);
    });

    it('makes the category public again after reactivation', async () => {
      const category = await createCategory({
        name: 'Clothing',
      });

      await adminAgent
        .patch(
          testRoutes.categories.deactivate(
            category._id,
          ),
        )
        .expect(200);

      await adminAgent
        .patch(
          testRoutes.categories.reactivate(
            category._id,
          ),
        )
        .expect(200);

      const response = await request(app.getHttpServer())
        .get(testRoutes.categories.root)
        .expect(200);

      expect(
        response.body.some(
          (item: { _id: string }) =>
            item._id === category._id,
        ),
      ).toBe(true);
    });

    it('returns 404 when the category does not exist', async () => {
      const missingId =
        new Types.ObjectId().toString();

      await adminAgent
        .patch(
          testRoutes.categories.reactivate(
            missingId,
          ),
        )
        .expect(404);
    });
  });

  // DELETE /categories/:id endpoint testing
  describe('DELETE /api/categories/:id', () => {
    it('returns 401 when unauthenticated', async () => {
      const id = new Types.ObjectId().toString();

      await request(app.getHttpServer())
        .delete(
          testRoutes.categories.byId(id),
        )
        .expect(401);
    });

    it('returns 403 for a customer', async () => {
      const category = await createCategory({
        name: 'Clothing',
      });

      await customerAgent
        .delete(
          testRoutes.categories.byId(
            category._id,
          ),
        )
        .expect(403);
    });

    it('permanently deletes a deactivated category as an admin', async () => {
      const category = await createCategory({
        name: 'Clothing',
      });

      // Category must be inactive before permanent deletion.
      await adminAgent
        .patch(
          testRoutes.categories.deactivate(
            category._id,
          ),
        )
        .expect(200);

      await adminAgent
        .delete(
          testRoutes.categories.byId(
            category._id,
          ),
        )
        .expect(200);

      const adminResponse = await adminAgent
        .get(testRoutes.categories.adminAll)
        .expect(200);

      expect(
        adminResponse.body.some(
          (item: { _id: string }) =>
            item._id === category._id,
        ),
      ).toBe(false);
    });

    it('returns 404 when the deleted category is requested by slug', async () => {
      const category = await createCategory({
        name: 'Clothing',
      });

      await adminAgent
        .patch(
          testRoutes.categories.deactivate(
            category._id,
          ),
        )
        .expect(200);

      await adminAgent
        .delete(
          testRoutes.categories.byId(
            category._id,
          ),
        )
        .expect(200);

      await request(app.getHttpServer())
        .get(
          testRoutes.categories.bySlug(
            category.slug,
          ),
        )
        .expect(404);
    });

    it('returns 404 when deleting a category that does not exist', async () => {
      const missingId =
        new Types.ObjectId().toString();

      await adminAgent
        .delete(
          testRoutes.categories.byId(
            missingId,
          ),
        )
        .expect(404);
    });

    it('returns 409 when trying to permanently delete an active category', async () => {
      const category = await createCategory({
        name: 'Clothing',
      });

      await adminAgent
        .delete(
          testRoutes.categories.byId(
            category._id,
          ),
        )
        .expect(409);
    });
  });
});