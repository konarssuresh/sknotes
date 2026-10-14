import "server-only";

import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";

import { deleteApplicationDataForUser } from "@/lib/application/delete-account";
import { getMongoClient, shouldUseMongoTransactions } from "@/lib/db/client";
import {
  getBetterAuthSecret,
  getBetterAuthUrl,
  getOptionalEnv,
  isGoogleOAuthConfigured,
} from "@/lib/db/env";
import {
  queuePasswordResetAuthEmail,
  queueVerificationAuthEmail,
} from "@/lib/email/send-auth-email";

function buildGoogleProvider() {
  if (!isGoogleOAuthConfigured()) {
    return undefined;
  }
  return {
    clientId: getOptionalEnv("GOOGLE_CLIENT_ID"),
    clientSecret: getOptionalEnv("GOOGLE_CLIENT_SECRET"),
    prompt: "select_account",
  };
}

function createAuth() {
  const client = getMongoClient();
  const dbName = getOptionalEnv("MONGODB_DB_NAME");
  const db = dbName ? client.db(dbName) : client.db();

  const adapterOptions = shouldUseMongoTransactions() ? { client } : {};

  const google = buildGoogleProvider();
  const isProduction = process.env.NODE_ENV === "production";

  return betterAuth({
    secret: getBetterAuthSecret(),
    baseURL: getBetterAuthUrl(),
    database: mongodbAdapter(db, adapterOptions),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: true,
      sendResetPassword: async ({ user, url }) => {
        queuePasswordResetAuthEmail({ user, url });
      },
    },
    emailVerification: {
      sendOnSignUp: true,
      sendOnSignIn: true,
      autoSignInAfterVerification: true,
      sendVerificationEmail: async ({ user, url }) => {
        queueVerificationAuthEmail({ user, url });
      },
    },
    socialProviders: google ? { google } : undefined,
    account: {
      accountLinking: {
        enabled: true,
        trustedProviders: ["google"],
      },
    },
    user: {
      deleteUser: {
        enabled: true,
        beforeDelete: async (user) => {
          await deleteApplicationDataForUser(user.id);
        },
      },
    },
    advanced: {
      ipAddress: {
        ipAddressHeaders: [
          "x-forwarded-for",
          "x-nf-client-connection-ip",
          "x-real-ip",
        ],
      },
      database: {
        joins: true,
      },
    },
    rateLimit: {
      enabled: isProduction,
      storage: "database",
      window: 60,
      max: 100,
      customRules: {
        "/sign-in/email": { window: 60, max: 10 },
        "/sign-up/email": { window: 60, max: 5 },
        "/request-password-reset": { window: 300, max: 5 },
        "/send-verification-email": { window: 300, max: 5 },
        "/reset-password": { window: 300, max: 10 },
        "/delete-user": { window: 3600, max: 3 },
      },
    },
    plugins: [nextCookies()],
  });
}

let authSingleton;

export function getAuth() {
  if (!authSingleton) {
    authSingleton = createAuth();
  }
  return authSingleton;
}

/** @internal Test helper */
export function resetAuthForTests() {
  authSingleton = undefined;
  globalThis.__sknotesMongo = undefined;
}

/** @type {ReturnType<typeof betterAuth>} */
export const auth = new Proxy(
  {},
  {
    get(_target, prop) {
      const instance = getAuth();
      const value = instance[prop];
      return typeof value === "function" ? value.bind(instance) : value;
    },
  }
);
