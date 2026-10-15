export const noteKeys = {
  all: ["notes"],
  list: (status = "active") => [...noteKeys.all, "list", status],
  detail: (id) => [...noteKeys.all, "detail", id],
};
