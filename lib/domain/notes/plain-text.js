const BLOCK_TYPES = new Set([
  "paragraph",
  "heading",
  "quote",
  "code",
  "listitem",
]);

/**
 * Walk validated Lexical serialized state and extract plain text.
 * @param {unknown} content
 */
export function plainTextFromLexical(content) {
  if (!content || typeof content !== "object") {
    return "";
  }

  const root = /** @type {{ root?: { children?: unknown[] } }} */ (content)
    .root;
  if (!root?.children || !Array.isArray(root.children)) {
    return "";
  }

  const lines = [];
  for (const child of root.children) {
    const line = extractBlockText(child);
    if (line.length > 0) {
      lines.push(line);
    } else {
      lines.push("");
    }
  }

  return lines
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trimEnd();
}

/**
 * @param {unknown} node
 */
function extractBlockText(node) {
  if (!node || typeof node !== "object") {
    return "";
  }

  const typed =
    /** @type {{ type?: string; children?: unknown[]; text?: string }} */ (
      node
    );

  if (typed.type === "linebreak") {
    return "\n";
  }

  if (typed.type === "text" && typeof typed.text === "string") {
    return typed.text;
  }

  if (typed.children && Array.isArray(typed.children)) {
    if (typed.type && BLOCK_TYPES.has(typed.type)) {
      return typed.children.map((c) => extractInlineText(c)).join("");
    }
    return typed.children.map((c) => extractBlockText(c)).join("");
  }

  return "";
}

/**
 * @param {unknown} node
 */
function extractInlineText(node) {
  if (!node || typeof node !== "object") {
    return "";
  }
  const typed =
    /** @type {{ type?: string; children?: unknown[]; text?: string }} */ (
      node
    );
  if (typed.type === "linebreak") {
    return "\n";
  }
  if (typed.type === "text" && typeof typed.text === "string") {
    return typed.text;
  }
  if (typed.children && Array.isArray(typed.children)) {
    return typed.children.map((c) => extractInlineText(c)).join("");
  }
  return "";
}
