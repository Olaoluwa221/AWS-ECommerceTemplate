// test/helpers/mongo-memory.helper.ts

import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer: MongoMemoryServer;

export async function startMongoMemoryServer(): Promise<string> {
  mongoServer = await MongoMemoryServer.create();

  return mongoServer.getUri();
}

export async function stopMongoMemoryServer(): Promise<void> {
  if (mongoServer) {
    await mongoServer.stop();
  }
}