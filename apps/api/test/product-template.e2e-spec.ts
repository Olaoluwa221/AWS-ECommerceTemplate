import type {
    INestApplication,
} from '@nestjs/common';

import type {
    Connection,
} from 'mongoose';

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

import {
    testRoutes,
} from './helper/test-routes.helper.js';

describe('ProductTemplate (e2e)', () => {
    let app: INestApplication;
    let connection: Connection;

    let adminAgent: TestAgent;
    let customerAgent: TestAgent;

    beforeAll(async () => {
        const context =
            await createTestApp();

        app = context.app;
        connection = context.connection;

        const agents =
            await createTestAuthAgents(app);

        adminAgent = agents.adminAgent;
        customerAgent =
            agents.customerAgent;
    });

    beforeEach(async () => {
        await connection
            .collection('productTemplates')
            .deleteMany({});

        await connection
            .collection('optionDefinitions')
            .deleteMany({});
    });

    afterAll(async () => {
        await closeTestApp(app);
    });

    async function createOptionDefinition(
        name: string,
    ) {
        const response = await adminAgent
            .post(
                testRoutes
                    .optionDefinitions
                    .root,
            )
            .send({
                name,
                displayName: name,
                values: [
                    'Value 1',
                    'Value 2',
                ],
            })
            .expect(201);

        return response.body;
    }

    async function createProductTemplate(
        data: {
            name: string;
            images?: string[];
            options?: string[];
        },
    ) {
        const response =
            await adminAgent
                .post(
                    testRoutes
                        .productTemplates
                        .root,
                )
                .send(data)
                .expect(201);

        return response.body;
    }

    describe(
        'POST /api/product-templates',
        () => {
            it(
                'returns 401 when unauthenticated',
                async () => {
                    await request(
                        app.getHttpServer(),
                    )
                        .post(
                            testRoutes
                                .productTemplates
                                .root,
                        )
                        .send({
                            name: 'T-Shirt',
                        })
                        .expect(401);
                },
            );

            it(
                'returns 403 for a customer',
                async () => {
                    await customerAgent
                        .post(
                            testRoutes
                                .productTemplates
                                .root,
                        )
                        .send({
                            name: 'T-Shirt',
                        })
                        .expect(403);
                },
            );

            it(
                'creates a template using active option definitions',
                async () => {
                    const size =
                        await createOptionDefinition(
                            'Size',
                        );

                    const color =
                        await createOptionDefinition(
                            'Color',
                        );

                    const response =
                        await adminAgent
                            .post(
                                testRoutes
                                    .productTemplates
                                    .root,
                            )
                            .send({
                                name: ' T-Shirt ',
                                images: [
                                    'front.jpg',
                                    'back.jpg',
                                ],
                                options: [
                                    size._id,
                                    color._id,
                                ],
                            })
                            .expect(201);

                    expect(
                        response.body.name,
                    ).toBe('T-Shirt');

                    expect(
                        response.body.images,
                    ).toEqual([
                        'front.jpg',
                        'back.jpg',
                    ]);

                    expect(
                        response.body.options,
                    ).toHaveLength(2);

                    expect(
                        response.body.isActive,
                    ).toBe(true);
                },
            );

            it(
                'rejects a duplicate name',
                async () => {
                    await createProductTemplate({
                        name: 'T-Shirt',
                    });

                    await adminAgent
                        .post(
                            testRoutes
                                .productTemplates
                                .root,
                        )
                        .send({
                            name: 'T-Shirt',
                        })
                        .expect(409);
                },
            );

            it(
                'rejects an unknown option definition',
                async () => {
                    await adminAgent
                        .post(
                            testRoutes
                                .productTemplates
                                .root,
                        )
                        .send({
                            name: 'T-Shirt',
                            options: [
                                '507f1f77bcf86cd799439011',
                            ],
                        })
                        .expect(404);
                },
            );

            it(
                'rejects an inactive option definition',
                async () => {
                    const size =
                        await createOptionDefinition(
                            'Size',
                        );

                    await adminAgent
                        .patch(
                            testRoutes
                                .optionDefinitions
                                .deactivate(
                                    size._id,
                                ),
                        )
                        .expect(200);

                    await adminAgent
                        .post(
                            testRoutes
                                .productTemplates
                                .root,
                        )
                        .send({
                            name: 'T-Shirt',
                            options: [
                                size._id,
                            ],
                        })
                        .expect(409);
                },
            );
        },
    );

    describe(
        'GET /api/product-templates',
        () => {
            it(
                'lists active templates first and includes inactive templates for admins',
                async () => {
                    const zebra =
                        await createProductTemplate({
                            name: 'Zebra',
                        });

                    const alpha =
                        await createProductTemplate({
                            name: 'Alpha',
                        });

                    const beta =
                        await createProductTemplate({
                            name: 'Beta',
                        });

                    await adminAgent
                        .patch(
                            testRoutes
                                .productTemplates
                                .deactivate(
                                    beta._id,
                                ),
                        )
                        .expect(200);

                    const response =
                        await adminAgent
                            .get(
                                testRoutes
                                    .productTemplates
                                    .root,
                            )
                            .expect(200);

                    expect(
                        response.body.map(
                            (
                                item: {
                                    name: string;
                                },
                            ) => item.name,
                        ),
                    ).toEqual([
                        'Alpha',
                        'Zebra',
                        'Beta',
                    ]);

                    expect(
                        response.body[0].isActive,
                    ).toBe(true);
                    expect(
                        response.body[2].isActive,
                    ).toBe(false);
                },
            );

            it(
                'returns a template by id',
                async () => {
                    const template =
                        await createProductTemplate({
                            name: 'T-Shirt',
                        });

                    const response =
                        await adminAgent
                            .get(
                                testRoutes
                                    .productTemplates
                                    .byId(
                                        template._id,
                                    ),
                            )
                            .expect(200);

                    expect(
                        response.body._id,
                    ).toBe(template._id);
                    expect(
                        response.body.name,
                    ).toBe('T-Shirt');
                    expect(
                        response.body.isActive,
                    ).toBe(true);
                },
            );

            it(
                'returns 400 for an invalid product template id',
                async () => {
                    await adminAgent
                        .get(
                            testRoutes
                                .productTemplates
                                .byId(
                                    'not-a-valid-object-id',
                                ),
                        )
                        .expect(400);
                },
            );

            it(
                'returns 404 for a missing product template',
                async () => {
                    await adminAgent
                        .get(
                            testRoutes
                                .productTemplates
                                .byId(
                                    '507f1f77bcf86cd799439011',
                                ),
                        )
                        .expect(404);
                },
            );
        },
    );

    describe(
        'PATCH /api/product-templates/:id',
        () => {
            it(
                'updates the template name, images, and option references',
                async () => {
                    const size =
                        await createOptionDefinition(
                            'Size',
                        );

                    const color =
                        await createOptionDefinition(
                            'Color',
                        );

                    const template =
                        await createProductTemplate({
                            name: 'Old Name',
                            images: ['old.jpg'],
                            options: [size._id],
                        });

                    const response =
                        await adminAgent
                            .patch(
                                testRoutes
                                    .productTemplates
                                    .byId(
                                        template._id,
                                    ),
                            )
                            .send({
                                name: '  Updated Name  ',
                                images: [
                                    ' front.jpg ',
                                    'back.jpg',
                                ],
                                options: [color._id],
                            })
                            .expect(200);

                    expect(
                        response.body.name,
                    ).toBe('Updated Name');

                    expect(
                        response.body.images,
                    ).toEqual([
                        'front.jpg',
                        'back.jpg',
                    ]);

                    expect(
                        response.body.options,
                    ).toEqual([color._id]);
                },
            );

            it(
                'rejects a duplicate name during update',
                async () => {
                    const original =
                        await createProductTemplate({
                            name: 'T-Shirt',
                        });

                    await createProductTemplate({
                        name: 'Hoodie',
                    });

                    await adminAgent
                        .patch(
                            testRoutes
                                .productTemplates
                                .byId(
                                    original._id,
                                ),
                        )
                        .send({
                            name: 'Hoodie',
                        })
                        .expect(409);
                },
            );

            it(
                'rejects an unknown option definition during update',
                async () => {
                    const template =
                        await createProductTemplate({
                            name: 'T-Shirt',
                        });

                    await adminAgent
                        .patch(
                            testRoutes
                                .productTemplates
                                .byId(
                                    template._id,
                                ),
                        )
                        .send({
                            options: [
                                '507f1f77bcf86cd799439011',
                            ],
                        })
                        .expect(404);
                },
            );
        },
    );

    describe(
        'PATCH lifecycle',
        () => {
            it(
                'deactivates and reactivates a template',
                async () => {
                    const template =
                        await createProductTemplate({
                            name: 'T-Shirt',
                        });

                    const deactivated =
                        await adminAgent
                            .patch(
                                testRoutes
                                    .productTemplates
                                    .deactivate(
                                        template._id,
                                    ),
                            )
                            .expect(200);

                    expect(
                        deactivated.body
                            .isActive,
                    ).toBe(false);

                    const reactivated =
                        await adminAgent
                            .patch(
                                testRoutes
                                    .productTemplates
                                    .reactivate(
                                        template._id,
                                    ),
                            )
                            .expect(200);

                    expect(
                        reactivated.body
                            .isActive,
                    ).toBe(true);
                },
            );

            it(
                'refuses reactivation when an option has become inactive',
                async () => {
                    const size =
                        await createOptionDefinition(
                            'Size',
                        );

                    const template =
                        await createProductTemplate({
                            name: 'T-Shirt',
                            options: [
                                size._id,
                            ],
                        });

                    await adminAgent
                        .patch(
                            testRoutes
                                .productTemplates
                                .deactivate(
                                    template._id,
                                ),
                        )
                        .expect(200);

                    await adminAgent
                        .patch(
                            testRoutes
                                .optionDefinitions
                                .deactivate(
                                    size._id,
                                ),
                        )
                        .expect(200);

                    await adminAgent
                        .patch(
                            testRoutes
                                .productTemplates
                                .reactivate(
                                    template._id,
                                ),
                        )
                        .expect(409);
                },
            );
        },
    );

    describe(
        'DELETE /api/product-templates/:id',
        () => {
            it(
                'rejects deletion of an active template',
                async () => {
                    const template =
                        await createProductTemplate({
                            name: 'T-Shirt',
                        });

                    await adminAgent
                        .delete(
                            testRoutes
                                .productTemplates
                                .byId(
                                    template._id,
                                ),
                        )
                        .expect(409);
                },
            );

            it(
                'permanently deletes an inactive template',
                async () => {
                    const template =
                        await createProductTemplate({
                            name: 'T-Shirt',
                        });

                    await adminAgent
                        .patch(
                            testRoutes
                                .productTemplates
                                .deactivate(
                                    template._id,
                                ),
                        )
                        .expect(200);

                    await adminAgent
                        .delete(
                            testRoutes
                                .productTemplates
                                .byId(
                                    template._id,
                                ),
                        )
                        .expect(204);

                    await adminAgent
                        .get(
                            testRoutes
                                .productTemplates
                                .byId(
                                    template._id,
                                ),
                        )
                        .expect(404);
                },
            );
        },
    );
});