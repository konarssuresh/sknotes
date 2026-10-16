export const noteKeys = {
  all: ["notes"],
  list: (status = "active", filters = {}) => [
    ...noteKeys.all,
    "list",
    status,
    filters.tagId ?? null,
    filters.pinned ?? null,
  ],
  search: (status = "active", filters = {}) => [
    ...noteKeys.all,
    "search",
    status,
    filters.q ?? "",
    filters.tagId ?? null,
  ],
  detail: (id) => [...noteKeys.all, "detail", id],
  counts: () => [...noteKeys.all, "counts"],
};

export const tagKeys = {
  all: ["tags"],
  list: () => [...tagKeys.all, "list"],
};
