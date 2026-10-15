export const NOTE_CONTENT_VERSION = 1;

export function createEmptyLexicalContent() {
  return {
    root: {
      children: [
        {
          children: [],
          direction: null,
          format: "",
          indent: 0,
          type: "paragraph",
          version: 1,
        },
      ],
      direction: null,
      format: "",
      indent: 0,
      type: "root",
      version: 1,
    },
  };
}

/**
 * @param {string} userId
 * @param {{ title?: string; content?: unknown }} [overrides]
 */
export function createNoteDefaults(userId, overrides = {}) {
  const now = new Date();
  return {
    userId,
    title: overrides.title ?? "",
    content: overrides.content ?? createEmptyLexicalContent(),
    contentVersion: NOTE_CONTENT_VERSION,
    plainText: "",
    tagIds: [],
    pinned: false,
    status: "active",
    revision: 1,
    createdAt: now,
    updatedAt: now,
  };
}
