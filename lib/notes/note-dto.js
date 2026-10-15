/**
 * @param {import('mongodb').Document | null | undefined} doc
 */
export function toNoteDto(doc) {
  if (!doc) {
    return null;
  }

  const id =
    doc._id && typeof doc._id.toString === "function"
      ? doc._id.toString()
      : String(doc._id);

  return {
    id,
    userId: doc.userId,
    title: doc.title ?? "",
    content: doc.content,
    contentVersion: doc.contentVersion ?? 1,
    plainText: doc.plainText ?? "",
    tagIds: Array.isArray(doc.tagIds) ? doc.tagIds : [],
    pinned: Boolean(doc.pinned),
    status: doc.status ?? "active",
    revision: doc.revision ?? 1,
    createdAt:
      doc.createdAt instanceof Date
        ? doc.createdAt.toISOString()
        : doc.createdAt,
    updatedAt:
      doc.updatedAt instanceof Date
        ? doc.updatedAt.toISOString()
        : doc.updatedAt,
  };
}

/**
 * @param {import('mongodb').Document | null | undefined} doc
 */
export function toNoteConflictDto(doc) {
  const full = toNoteDto(doc);
  if (!full) {
    return null;
  }
  return {
    id: full.id,
    title: full.title,
    content: full.content,
    revision: full.revision,
    updatedAt: full.updatedAt,
    status: full.status,
  };
}
