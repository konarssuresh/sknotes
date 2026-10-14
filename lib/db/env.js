const MONGO_URI_PATTERN = /^mongodb(\+srv)?:\/\//;

/**
 * @param {string} name
 * @returns {string}
 */
export function getRequiredEnv(name) {
  const value = process.env[name];
  if (!value || value.trim() === "") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value.trim();
}

/**
 * @param {string} name
 * @returns {string | undefined}
 */
export function getOptionalEnv(name) {
  const value = process.env[name];
  if (!value || value.trim() === "") {
    return undefined;
  }
  return value.trim();
}

export function validateMongoUri(uri) {
  if (!MONGO_URI_PATTERN.test(uri)) {
    throw new Error(
      "MONGODB_URI must be a mongodb:// or mongodb+srv:// connection string"
    );
  }
}

export function getMongoUri() {
  const uri = getRequiredEnv("MONGODB_URI");
  validateMongoUri(uri);
  return uri;
}

export function getBetterAuthSecret() {
  const secret = getRequiredEnv("BETTER_AUTH_SECRET");
  if (process.env.NODE_ENV === "production" && secret.length < 32) {
    throw new Error(
      "BETTER_AUTH_SECRET must be at least 32 characters in production"
    );
  }
  return secret;
}

export function getBetterAuthUrl() {
  const url = getRequiredEnv("BETTER_AUTH_URL");
  try {
    new URL(url);
  } catch {
    throw new Error("BETTER_AUTH_URL must be a valid URL");
  }
  return url.replace(/\/$/, "");
}

export function isGoogleOAuthConfigured() {
  return Boolean(
    getOptionalEnv("GOOGLE_CLIENT_ID") && getOptionalEnv("GOOGLE_CLIENT_SECRET")
  );
}

export function isResendConfigured() {
  return Boolean(
    getOptionalEnv("RESEND_API_KEY") && getOptionalEnv("EMAIL_FROM")
  );
}
