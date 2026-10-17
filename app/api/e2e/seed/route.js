import { NextResponse } from "next/server";

import { getAuth } from "@/lib/auth/auth";
import { getDb } from "@/lib/db/client";
import {
  E2E_USER_EMAIL,
  E2E_USER_NAME,
  E2E_USER_PASSWORD,
} from "@/lib/e2e/constants";

function isE2eSeedEnabled() {
  return process.env.E2E_TEST_MODE === "1";
}

/**
 * @param {{ id?: string; _id?: { toString(): string } }} user
 */
function resolveUserId(user) {
  if (user.id) {
    return String(user.id);
  }
  if (user._id) {
    return user._id.toString();
  }
  return null;
}

export async function POST() {
  if (!isE2eSeedEnabled()) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const auth = getAuth();
  const email = E2E_USER_EMAIL.toLowerCase();
  const db = await getDb();

  const existing = await db.collection("user").findOne({ email });
  if (existing) {
    const userId = resolveUserId(existing);
    if (userId) {
      await db.collection("account").deleteMany({
        $or: [{ userId }, { accountId: userId }],
      });
      await db.collection("session").deleteMany({ userId });
    }
    await db.collection("user").deleteOne({ email });
  }

  await auth.api.signUpEmail({
    body: {
      email: E2E_USER_EMAIL,
      password: E2E_USER_PASSWORD,
      name: E2E_USER_NAME,
    },
  });

  await db
    .collection("user")
    .updateOne(
      { email },
      { $set: { emailVerified: true, name: E2E_USER_NAME } }
    );

  const user = await db.collection("user").findOne({ email });
  const userId = user ? resolveUserId(user) : null;
  if (!userId) {
    return NextResponse.json(
      { error: "Failed to seed E2E user" },
      { status: 500 }
    );
  }

  const credentialAccount = await db.collection("account").findOne({
    providerId: "credential",
    $or: [{ userId }, { accountId: userId }],
  });

  if (!credentialAccount) {
    return NextResponse.json(
      { error: "E2E user missing credential account" },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, userId });
}
