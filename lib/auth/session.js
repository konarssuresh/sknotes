import "server-only";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth/auth";

export async function getSession() {
  const headerStore = await headers();
  return auth.api.getSession({
    headers: headerStore,
  });
}

export async function requireSession() {
  const session = await getSession();
  if (!session?.user?.id) {
    redirect("/login");
  }
  return session;
}

/**
 * @param {{ emailVerified?: boolean | null } | null | undefined} user
 */
export function isEmailVerified(user) {
  if (process.env.E2E_TEST_MODE === "1") {
    return true;
  }
  return Boolean(user?.emailVerified);
}

export async function requireVerifiedSession() {
  const session = await requireSession();
  if (!isEmailVerified(session.user)) {
    redirect("/verify-email");
  }
  return session;
}
