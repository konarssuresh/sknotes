import { noteKeys } from "@/features/notes/query-keys";

/**
 * @param {import('@tanstack/react-query').QueryClient} queryClient
 */
export function invalidateNoteListCaches(queryClient) {
  queryClient.invalidateQueries({ queryKey: noteKeys.all });
}
