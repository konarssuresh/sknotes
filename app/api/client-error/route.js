import { getOptionalEnv } from "@/lib/db/env";
import { handleRouteError } from "@/lib/errors/handle-route-error";
import { consumeRateLimit, getClientIp } from "@/lib/http/rate-limit";
import { parseJsonBody } from "@/lib/http/parse-json-body";
import {
  getOrCreateRequestId,
  redactForLog,
  REQUEST_ID_HEADER,
} from "@/lib/logging/request-context";
import { clientErrorReportSchema } from "@/lib/validation/client-error-schema";

function isClientErrorReportingEnabled() {
  return getOptionalEnv("CLIENT_ERROR_REPORTING_ENABLED") === "1";
}

export async function POST(request) {
  const requestId = getOrCreateRequestId(request);

  try {
    if (!isClientErrorReportingEnabled()) {
      return new Response(null, { status: 204 });
    }

    const ip = getClientIp(request);
    await consumeRateLimit({
      key: `client-error:${ip}`,
      windowSeconds: 60,
      max: 30,
    });

    const body = await parseJsonBody(request, clientErrorReportSchema, 4096);

    console.error(
      "[client-error]",
      redactForLog({
        requestId,
        route: body.route,
        message: body.message,
        digest: body.digest,
        lastApiRequestId: body.lastApiRequestId,
        swVersion: body.swVersion,
        buildId: body.buildId,
      })
    );

    return Response.json(
      { ok: true, accepted: true },
      { headers: { [REQUEST_ID_HEADER]: requestId } }
    );
  } catch (error) {
    return handleRouteError(error, requestId);
  }
}
