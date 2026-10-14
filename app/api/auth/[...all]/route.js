import { toNextJsHandler } from "better-auth/next-js";

import { getAuth } from "@/lib/auth/auth";

function getHandler() {
  return toNextJsHandler(getAuth());
}

export async function GET(request) {
  const handler = getHandler();
  return handler.GET(request);
}

export async function POST(request) {
  const handler = getHandler();
  return handler.POST(request);
}
