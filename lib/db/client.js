import "server-only";

import { MongoClient } from "mongodb";

import { getMongoUri, getOptionalEnv } from "@/lib/db/env";

const globalForMongo = globalThis;

function createClient() {
  const uri = getMongoUri();
  const options = {};
  const maxPool = getOptionalEnv("MONGODB_MAX_POOL_SIZE");
  if (maxPool) {
    options.maxPoolSize = Number.parseInt(maxPool, 10);
  }
  return new MongoClient(uri, options);
}

function getCached() {
  if (!globalForMongo.__sknotesMongo) {
    globalForMongo.__sknotesMongo = { client: null, promise: null };
  }
  return globalForMongo.__sknotesMongo;
}

export function getMongoClient() {
  const cached = getCached();
  if (!cached.client) {
    cached.client = createClient();
  }
  return cached.client;
}

export async function connectMongo() {
  const cached = getCached();
  const client = getMongoClient();
  if (!cached.promise) {
    cached.promise = client.connect();
  }
  await cached.promise;
  return client;
}

export async function getDb() {
  const client = await connectMongo();
  const dbName = getOptionalEnv("MONGODB_DB_NAME");
  return dbName ? client.db(dbName) : client.db();
}

export function shouldUseMongoTransactions() {
  const flag = getOptionalEnv("MONGODB_USE_TRANSACTIONS");
  if (flag === "false") {
    return false;
  }
  if (flag === "true") {
    return true;
  }
  return getMongoUri().includes("mongodb+srv://");
}
