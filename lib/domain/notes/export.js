import { plainTextFromLexical } from "@/lib/domain/notes/plain-text";

/**
 * @param {{ title?: string; content?: unknown }} note
 */
export function noteToPlainTextExport(note) {
  const title = (note.title ?? "").trim();
  const body = plainTextFromLexical(note.content).trim();
  if (!title && !body) {
    return "";
  }
  if (!title) {
    return body;
  }
  if (!body) {
    return title;
  }
  return `${title}\n\n${body}`;
}

/**
 * @param {{ title?: string; content?: unknown }} note
 */
export function noteToMarkdownExport(note) {
  const title = (note.title ?? "").trim();
  const bodyMd = lexicalToMarkdown(note.content);
  const parts = [];
  if (title) {
    parts.push(`# ${escapeMarkdownInline(title)}`, "");
  }
  if (bodyMd.trim()) {
    parts.push(bodyMd.trim());
  }
  return parts.join("\n").trim();
}

/**
 * @param {unknown} content
 */
function lexicalToMarkdown(content) {
  if (!content || typeof content !== "object") {
    return "";
  }
  const root = /** @type {{ root?: { children?: unknown[] } }} */ (content)
    .root;
  if (!root?.children || !Array.isArray(root.children)) {
    return "";
  }
  return root.children.map((child) => blockToMarkdown(child, 0)).join("\n\n");
}

/**
 * @param {unknown} node
 * @param {number} listDepth
 */
function blockToMarkdown(node, listDepth) {
  if (!node || typeof node !== "object") {
    return "";
  }
  const typed =
    /** @type {{ type?: string; tag?: string; listType?: string; children?: unknown[] }} */ (
      node
    );

  switch (typed.type) {
    case "heading": {
      const level = typed.tag === "h1" ? 1 : typed.tag === "h3" ? 3 : 2;
      const hashes = "#".repeat(Math.min(level, 3));
      return `${hashes} ${inlineToMarkdown(typed.children)}`.trim();
    }
    case "quote":
      return inlineToMarkdown(typed.children)
        .split("\n")
        .map((line) => `> ${line}`)
        .join("\n");
    case "code":
      return `\`\`\`\n${inlineToMarkdown(typed.children)}\n\`\`\``;
    case "list": {
      const ordered = typed.listType === "number";
      const items = (typed.children ?? []).map((item, index) => {
        const prefix = ordered ? `${index + 1}.` : "-";
        const indent = "  ".repeat(listDepth);
        const text = blockToMarkdown(item, listDepth + 1);
        return `${indent}${prefix} ${text.replace(/^\s+/, "")}`;
      });
      return items.join("\n");
    }
    case "listitem":
      return inlineToMarkdown(typed.children);
    case "paragraph":
    default:
      return inlineToMarkdown(typed.children);
  }
}

/**
 * @param {unknown[] | undefined} children
 */
function inlineToMarkdown(children) {
  if (!children || !Array.isArray(children)) {
    return "";
  }
  return children
    .map((child) => {
      if (!child || typeof child !== "object") {
        return "";
      }
      const typed =
        /** @type {{ type?: string; text?: string; format?: number; url?: string; children?: unknown[] }} */ (
          child
        );
      if (typed.type === "linebreak") {
        return "\n";
      }
      if (typed.type === "text" && typeof typed.text === "string") {
        let text = typed.text;
        const format = typeof typed.format === "number" ? typed.format : 0;
        if (format & 1) {
          text = `**${text}**`;
        }
        if (format & 2) {
          text = `*${text}*`;
        }
        if (format & 16) {
          text = `\`${text}\``;
        }
        return text;
      }
      if (typed.type === "link" && typed.url) {
        const label = inlineToMarkdown(typed.children) || typed.url;
        return `[${label}](${typed.url})`;
      }
      if (typed.children) {
        return inlineToMarkdown(typed.children);
      }
      return "";
    })
    .join("");
}

/**
 * @param {string} text
 */
function escapeMarkdownInline(text) {
  return text.replace(/([\\`*_[\]#])/g, "\\$1");
}
