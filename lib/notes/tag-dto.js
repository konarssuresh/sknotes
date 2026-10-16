/**
 * @param {import('mongodb').Document | null | undefined} doc
 * @param {number} [noteCount]
 */
export function toTagDto(doc, noteCount = 0) {
  if (!doc) {
    return null;
  }
  const id =
    doc._id && typeof doc._id.toString === "function"
      ? doc._id.toString()
      : String(doc._id);

  return {
    id,
    name: doc.name ?? "",
    noteCount,
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
