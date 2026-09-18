import type { INestApplication } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import request from 'supertest';

import {
    User,
    type UserDocument,
} from '../../src/users/schema/user.schema.js';

import { UserRole } from '../../src/users/enums/user-role.enum.js';
import { testRoutes } from './test-routes.helper.js';

export type TestAgent = ReturnType<typeof request.agent>;

const CUSTOMER = {
    firstName: 'Test',
    lastName: 'Customer',
    email: 'customer@test.com',
    password: 'Password123!',
    marketingOptIn: false,
};

const ADMIN = {
    firstName: 'Test',
    lastName: 'Admin',
    email: 'admin@test.com',
    password: 'Password123!',
    marketingOptIn: false,
};

export interface TestAuthAgents {
    customerAgent: TestAgent;
    adminAgent: TestAgent;
}



/**
 * Registers a user through the real API.
 *
 * Registration automatically creates the user as CUSTOMER.
 */
async function registerUser(
    app: INestApplication,
    user: typeof CUSTOMER,
): Promise<void> {
    await request(app.getHttpServer())
        .post(testRoutes.auth.register)
        .send(user)
        .expect(201);
}

/**
 * Logs a user in through the real API.
 *
 * Supertest's agent stores the HttpOnly access_token cookie
 * returned by /auth/login and automatically sends it on
 * later requests.
 */
async function loginUser(
    app: INestApplication,
    email: string,
    password: string,
): Promise<TestAgent> {
    const agent = request.agent(app.getHttpServer());

    await agent
        .post(testRoutes.auth.login)
        .send({
            email,
            password,
        })
        .expect(200);

    return agent;
}

/**
 * Creates the reusable authenticated CUSTOMER and ADMIN
 * sessions needed by E2E tests.
 */
export async function createTestAuthAgents(
    app: INestApplication,
): Promise<TestAuthAgents> {
    // Register Customer Account
    await registerUser(app, CUSTOMER);

    // Register Admin account
    await registerUser(app, ADMIN);

    // Get the User model connected to MongoMemoryServer.
    const userModel = app.get<Model<UserDocument>>(getModelToken(User.name));

    // Promote admin account to Admin
    const result = await userModel.updateOne(
        {
            email: ADMIN.email,
        },
        {
            $set: {
                role: UserRole.ADMIN,
            },
        },
    );

    if (result.matchedCount !== 1) {
        throw new Error(
            'Failed to promote test user to ADMIN.',
        );
    }

    // Create agent sessions for admin and customer
    const customerAgent = await loginUser(
        app,
        CUSTOMER.email,
        CUSTOMER.password,
    );

    const adminAgent = await loginUser(
        app,
        ADMIN.email,
        ADMIN.password,
    );

    return {
        customerAgent,
        adminAgent,
    };
}