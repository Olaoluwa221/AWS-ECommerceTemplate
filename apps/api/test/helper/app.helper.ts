import {
    type INestApplication,
    ValidationPipe,
} from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import {
    getConnectionToken,
} from '@nestjs/mongoose';
import type { Connection } from 'mongoose';
import cookieParser from 'cookie-parser';

import { AppModule } from '../../src/app.module.js';

import {
    startMongoMemoryServer,
    stopMongoMemoryServer,
} from './mongo-memory.helper.js';

export interface TestAppContext {
    app: INestApplication;
    connection: Connection;
}

//Create a Nest application for E2E testing.

export async function createTestApp(): Promise<TestAppContext> {

    // Start temporary MongoDB
    const mongoUri = await startMongoMemoryServer();

    //Setup temp Mongo server
    process.env.MONGODB_URI = mongoUri;

    // Build Nest application module.
    const moduleFixture: TestingModule =
        await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

    const app = moduleFixture.createNestApplication();

    // Match main.ts.
    app.setGlobalPrefix('api');
    app.use(cookieParser());

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    );

    await app.init();

    // Get the actual Mongoose connection Nest is using
    const connection = app.get<Connection>(
        getConnectionToken(),
    );

    return {
        app,
        connection,
    };
}

/**
 * Shut down app
 */
export async function closeTestApp(
    app: INestApplication,
): Promise<void> {
    await app.close();
    await stopMongoMemoryServer();
}