import type { INestApplication } from '@nestjs/common';
import type { Connection } from 'mongoose';
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
    type TestAgent,
} from './helper/auth.helper.js';
import { testRoutes } from './helper/test-routes.helper.js';

// Option-definition testing group
describe('Option-definition (e2e)', () => {

    let app: INestApplication;
    let connection: Connection;

    let adminAgent: TestAgent;
    let customerAgent: TestAgent;

    async function createOptionDefinition(
        data: {
            name: string;
            displayName: string;
            values: string[];
        },
    ) {
        const response = await adminAgent
            .post(testRoutes.optionDefinitions.root)
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

    //Clear option-definitions collection
    beforeEach(async () => {
        await connection
            .collection('optionDefinitions')
            .deleteMany({});
    });

    // Closes the app after the suite is complete.
    afterAll(async () => {
        await closeTestApp(app);
    });

    // Tests for creating option definitions
    describe('POST /api/option-definitions', () => {
        it('returns 401 when unauthenticated', async () => {
            await request(app.getHttpServer())
                .post(testRoutes.optionDefinitions.root)
                .send({
                    name: 'Size',
                    displayName: 'Size',
                    values: ['S', 'M', 'L'],
                })
                .expect(401);
        });

        it('returns 403 for a customer', async () => {
            await customerAgent
                .post(testRoutes.optionDefinitions.root)
                .send({
                    name: 'Size',
                    displayName: 'Size',
                    values: ['S', 'M', 'L'],
                })
                .expect(403);
        });

        it('creates an option definition as an admin', async () => {
            const response = await adminAgent
                .post(testRoutes.optionDefinitions.root)
                .send({
                    name: 'Size',
                    displayName: 'Size',
                    values: ['S', 'M', 'L'],
                })
                .expect(201);

            expect(response.body.name).toBe('size');
            expect(response.body.displayName).toBe('Size');
            expect(response.body.values).toEqual(['S', 'M', 'L']);
            expect(response.body.isActive).toBe(true);
            expect(response.body._id).toBeDefined();
        });

        it('rejects duplicate names', async () => {
            await createOptionDefinition(
                {
                    name: 'Color',
                    displayName: 'Color',
                    values: ['Red', 'Blue'],
                }
            );

            await adminAgent
                .post(testRoutes.optionDefinitions.root)
                .send({
                    name: 'color',
                    displayName: 'Color 2',
                    values: ['Green'],
                })
                .expect(409);
        });

        it('rejects duplicate values ignoring case', async () => {
            await adminAgent
                .post(testRoutes.optionDefinitions.root)
                .send({
                    name: 'Size',
                    displayName: 'Size',
                    values: ['Small', 'small'],
                })
                .expect(400);
        });

        it('rejects an invalid DTO', async () => {
            await adminAgent
                .post(testRoutes.optionDefinitions.root)
                .send({
                    name: '',
                    displayName: '',
                    values: ['   ', 'S'],
                })
                .expect(400);
        });
    });

    // Tests for retrieving all option definitions
    describe('GET /api/option-definitions', () => {
        it('returns 401 when unauthenticated', async () => {
            await request(app.getHttpServer())
                .get(testRoutes.optionDefinitions.root)
                .expect(401);
        });

        it('returns 403 for a customer', async () => {
            await customerAgent
                .get(testRoutes.optionDefinitions.root)
                .expect(403);
        });

        it('returns all option definitions for an admin', async () => {
            const size = await createOptionDefinition({
                name: 'Size',
                displayName: 'Size',
                values: ['S', 'M', 'L'],
            });

            const material = await createOptionDefinition({
                name: 'Material',
                displayName: 'Material',
                values: ['Cotton', 'Denim'],
            });

            const response = await adminAgent
                .get(testRoutes.optionDefinitions.root)
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);

            expect(
                response.body.some(
                    (item: { _id: string }) =>
                        item._id === size._id,
                ),
            ).toBe(true);

            expect(
                response.body.some(
                    (item: { _id: string }) =>
                        item._id === material._id,
                ),
            ).toBe(true);
        });
    });

    // Tests for retrieving an option definition by name
    describe('GET /api/option-definitions/:name', () => {
        it('returns 401 when unauthenticated', async () => {
            await request(app.getHttpServer())
                .get(testRoutes.optionDefinitions.byName('size'))
                .expect(401);
        });

        it('returns 403 for a customer', async () => {
            await customerAgent
                .get(testRoutes.optionDefinitions.byName('size'))
                .expect(403);
        });

        it('returns an option definition by name', async () => {
            await createOptionDefinition({
                name: 'Size',
                displayName: 'Size',
                values: ['S', 'M', 'L'],
            });

            const response = await adminAgent
                .get(testRoutes.optionDefinitions.byName(`Size`))
                .expect(200);

            expect(response.body.name).toBe(`size`);
            expect(response.body.displayName).toBe('Size');
            expect(response.body.values).toEqual(['S', 'M', 'L']);
        });

        it('returns 404 for an unknown option definition', async () => {
            await adminAgent
                .get(testRoutes.optionDefinitions.byName('unknown-option'))
                .expect(404);
        });
    });

    // Tests for updating an option definition's display name and values
    describe('PATCH /api/option-definitions/:id', () => {
        it('returns 401 when unauthenticated', async () => {
            const optionDefinition = await createOptionDefinition({
                name: 'Size',
                displayName: 'Size',
                values: ['S', 'M', 'L'],
            });

            await request(app.getHttpServer())
                .patch(testRoutes.optionDefinitions.byId(optionDefinition._id))
                .send({ displayName: 'Sizes' })
                .expect(401);
        });

        it('returns 403 for a customer', async () => {
            const optionDefinition = await createOptionDefinition({
                name: 'Size',
                displayName: 'Size',
                values: ['S', 'M', 'L'],
            });

            await customerAgent
                .patch(testRoutes.optionDefinitions.byId(optionDefinition._id))
                .send({ displayName: 'Sizes' })
                .expect(403);
        });

        it('updates an option definition', async () => {
            const optionDefinition = await createOptionDefinition({
                name: 'Size',
                displayName: 'Size',
                values: ['S', 'M', 'L'],
            });

            const response = await adminAgent
                .patch(testRoutes.optionDefinitions.byId(optionDefinition._id))
                .send({
                    displayName: 'Sizes',
                    values: ['XS', 'S', 'M', 'L'],
                })
                .expect(200);

            expect(response.body.displayName).toBe('Sizes');
            expect(response.body.values).toEqual(['XS', 'S', 'M', 'L']);
        });

        it('rejects attempts to change the name', async () => {
            const optionDefinition = await createOptionDefinition({
                name: 'Size',
                displayName: 'Size',
                values: ['S', 'M', 'L'],
            });

            await adminAgent
                .patch(
                    testRoutes.optionDefinitions.byId(
                        optionDefinition._id,
                    ),
                )
                .send({
                    name: 'New Size Name',
                })
                .expect(400);
        });

        it('rejects duplicate values when updating', async () => {
            const optionDefinition = await createOptionDefinition({
                name: 'Size',
                displayName: 'Size',
                values: ['S', 'M', 'L'],
            });

            await adminAgent
                .patch(
                    testRoutes.optionDefinitions.byId(
                        optionDefinition._id,
                    ),
                )
                .send({
                    values: ['Small', 'small'],
                })
                .expect(400);
        });

        it('returns 400 for an invalid id', async () => {
            await adminAgent
                .patch(testRoutes.optionDefinitions.byId('not-a-valid-id'))
                .send({ displayName: 'Sizes' })
                .expect(400);
        });
    });

    // Tests for deactivating an option definition
    describe('PATCH /api/option-definitions/:id/deactivate', () => {
        it('returns 401 when unauthenticated', async () => {
            const optionDefinition = await createOptionDefinition({
                name: 'Size',
                displayName: 'Size',
                values: ['S', 'M', 'L'],
            });

            await request(app.getHttpServer())
                .patch(testRoutes.optionDefinitions.deactivate(optionDefinition._id))
                .expect(401);
        });

        it('returns 400 for an invalid id', async () => {
            await adminAgent
                .patch(
                    testRoutes.optionDefinitions.deactivate(
                        'not-a-valid-id',
                    ),
                )
                .expect(400);
        });
        it('returns 403 for a customer', async () => {
            const optionDefinition = await createOptionDefinition({
                name: 'Size',
                displayName: 'Size',
                values: ['S', 'M', 'L'],
            });

            await customerAgent
                .patch(testRoutes.optionDefinitions.deactivate(optionDefinition._id))
                .expect(403);
        });

        it('deactivates an option definition', async () => {
            const optionDefinition = await createOptionDefinition({
                name: 'Size',
                displayName: 'Size',
                values: ['S', 'M', 'L'],
            });

            const response = await adminAgent
                .patch(testRoutes.optionDefinitions.deactivate(optionDefinition._id))
                .expect(200);

            expect(response.body.isActive).toBe(false);
        });
    });

    // Tests for reactivating an option definition
    describe('PATCH /api/option-definitions/:id/reactivate', () => {
        it('returns 401 when unauthenticated', async () => {
            const optionDefinition = await createOptionDefinition({
                name: 'Size',
                displayName: 'Size',
                values: ['S', 'M', 'L'],
            });

            await adminAgent
                .patch(testRoutes.optionDefinitions.deactivate(optionDefinition._id))
                .expect(200);

            await request(app.getHttpServer())
                .patch(testRoutes.optionDefinitions.reactivate(optionDefinition._id))
                .expect(401);
        });

        it('returns 400 for an invalid id', async () => {
            await adminAgent
                .patch(
                    testRoutes.optionDefinitions.reactivate(
                        'not-a-valid-id',
                    ),
                )
                .expect(400);
        });

        it('returns 403 for a customer', async () => {
            const optionDefinition = await createOptionDefinition({
                name: 'Size',
                displayName: 'Size',
                values: ['S', 'M', 'L'],
            });

            await adminAgent
                .patch(testRoutes.optionDefinitions.deactivate(optionDefinition._id))
                .expect(200);

            await customerAgent
                .patch(testRoutes.optionDefinitions.reactivate(optionDefinition._id))
                .expect(403);
        });

        it('reactivates an option definition', async () => {
            const optionDefinition = await createOptionDefinition({
                name: 'Size',
                displayName: 'Size',
                values: ['S', 'M', 'L'],
            });

            await adminAgent
                .patch(testRoutes.optionDefinitions.deactivate(optionDefinition._id))
                .expect(200);

            const response = await adminAgent
                .patch(testRoutes.optionDefinitions.reactivate(optionDefinition._id))
                .expect(200);

            expect(response.body.isActive).toBe(true);
        });
    });

    // Tests for deleting an option definition permanently
    describe('DELETE /api/option-definitions/:id', () => {
        it('returns 401 when unauthenticated', async () => {
            const optionDefinition = await createOptionDefinition({
                name: 'Size',
                displayName: 'Size',
                values: ['S', 'M', 'L'],
            });

            await adminAgent
                .patch(testRoutes.optionDefinitions.deactivate(optionDefinition._id))
                .expect(200);

            await request(app.getHttpServer())
                .delete(testRoutes.optionDefinitions.byId(optionDefinition._id))
                .expect(401);
        });

        it('returns 403 for a customer', async () => {
            const optionDefinition = await createOptionDefinition({
                name: 'Size',
                displayName: 'Size',
                values: ['S', 'M', 'L'],
            });

            await adminAgent
                .patch(testRoutes.optionDefinitions.deactivate(optionDefinition._id))
                .expect(200);

            await customerAgent
                .delete(testRoutes.optionDefinitions.byId(optionDefinition._id))
                .expect(403);
        });

        it('removes an inactive option definition', async () => {
            const optionDefinition = await createOptionDefinition({
                name: 'Size',
                displayName: 'Size',
                values: ['S', 'M', 'L'],
            });

            await adminAgent
                .patch(
                    testRoutes.optionDefinitions.deactivate(
                        optionDefinition._id,
                    ),
                )
                .expect(200);

            await adminAgent
                .delete(
                    testRoutes.optionDefinitions.byId(
                        optionDefinition._id,
                    ),
                )
                .expect(204);

            await adminAgent
                .get(
                    testRoutes.optionDefinitions.byName(
                        optionDefinition.name,
                    ),
                )
                .expect(404);
        });

        it('returns 409 when deleting an active option definition', async () => {
            const optionDefinition = await createOptionDefinition({
                name: 'Size',
                displayName: 'Size',
                values: ['S', 'M', 'L'],
            });

            await adminAgent
                .delete(testRoutes.optionDefinitions.byId(optionDefinition._id))
                .expect(409);
        });

        it('returns 400 for an invalid id', async () => {
            await adminAgent
                .delete(testRoutes.optionDefinitions.byId('not-a-valid-id'))
                .expect(400);
        });
    });
});