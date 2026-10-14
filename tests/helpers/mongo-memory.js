import { MongoMemoryServer } from "mongodb-memory-server";

let memoryServer;

export async function startMemoryMongo() {
  memoryServer = await MongoMemoryServer.create();
  const uri = memoryServer.getUri();
  process.env.MONGODB_URI = uri;
  process.env.MONGODB_USE_TRANSACTIONS = "false";
  process.env.BETTER_AUTH_SECRET =
    process.env.BETTER_AUTH_SECRET || "test-secret-at-least-32-characters-long";
  process.env.BETTER_AUTH_URL =
    process.env.BETTER_AUTH_URL || "http://localhost:3000";
  process.env.NEXT_PUBLIC_BETTER_AUTH_URL =
    process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000";
  return uri;
}

export async function stopMemoryMongo() {
  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = undefined;
  }
}

export function resetAuthSingleton() {
  globalThis.__sknotesMongo = undefined;
  globalThis.__sknotesAuthReset?.();
}
