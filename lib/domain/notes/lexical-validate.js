import { z } from "zod";

import { assertSafeUrl } from "@/lib/domain/notes/safe-url";
import { ApiError, ErrorCodes } from "@/lib/errors/api-error";

export const MAX_LEXICAL_JSON_BYTES = 1_048_576;

const ALLOWED_NODE_TYPES = new Set([
  "root",
  "paragraph",
  "heading",
  "quote",
  "list",
  "listitem",
  "link",
  "text",
  "linebreak",
  "code",
]);

const lexicalNodeSchema = z.lazy(() =>
  z
    .object({
      type: z.string(),
      version: z.number().optional(),
      children: z.array(lexicalNodeSchema).optional(),
      text: z.string().optional(),
      format: z.union([z.string(), z.number()]).optional(),
      indent: z.number().optional(),
      direction: z.string().nullable().optional(),
      tag: z.string().optional(),
      listType: z.string().optional(),
      url: z.string().optional(),
      rel: z.string().optional(),
      target: z.string().optional(),
      title: z.string().optional(),
    })
    .passthrough()
);

export const lexicalContentSchema = z.object({
  root: lexicalNodeSchema,
});

/**
 * @param {unknown} content
 */
export function validateLexicalContent(content) {
  const json = JSON.stringify(content);
  if (json.length > MAX_LEXICAL_JSON_BYTES) {
    throw new ApiError(
      ErrorCodes.PAYLOAD_TOO_LARGE,
      "Note content is too large",
      413
    );
  }

  const parsed = lexicalContentSchema.safeParse(content);
  if (!parsed.success) {
    throw new ApiError(
      ErrorCodes.VALIDATION_ERROR,
      "Invalid note content",
      400,
      { reason: "INVALID_LEXICAL" }
    );
  }

  validateNodeTree(parsed.data.root);
  return parsed.data;
}

/**
 * @param {z.infer<typeof lexicalNodeSchema>} node
 */
function validateNodeTree(node) {
  if (!ALLOWED_NODE_TYPES.has(node.type)) {
    throw new ApiError(
      ErrorCodes.VALIDATION_ERROR,
      "Unsupported content node type",
      400,
      { reason: "INVALID_LEXICAL_NODE", nodeType: node.type }
    );
  }

  if (node.type === "link") {
    if (!node.url) {
      throw new ApiError(
        ErrorCodes.VALIDATION_ERROR,
        "Link is missing a URL",
        400
      );
    }
    try {
      assertSafeUrl(node.url);
    } catch {
      throw new ApiError(
        ErrorCodes.VALIDATION_ERROR,
        "Link URL is not allowed",
        400,
        { reason: "UNSAFE_LINK" }
      );
    }
  }

  if (node.children) {
    for (const child of node.children) {
      validateNodeTree(child);
    }
  }
}
