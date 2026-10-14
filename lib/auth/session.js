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
