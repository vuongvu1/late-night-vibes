/**
 * The chat backfills older messages when the user scrolls to the top. But a
 * scroll event can only fire when the list overflows its container — if the
 * panel is expanded large enough that all loaded messages fit (no scrollbar),
 * the scroll trigger never fires and history would never load. This predicate
 * detects that case so the panel can backfill proactively, page by page, until
 * the list overflows or the history is exhausted.
 *
 * The `clientHeight > 0` guard skips unmeasured containers (e.g. jsdom, which
 * reports 0 for all layout metrics), keeping the effect inert in tests.
 */
export const shouldBackfill = (
  metrics: { scrollHeight: number; clientHeight: number },
  hasMore: boolean,
  isLoadingMore: boolean,
): boolean =>
  hasMore &&
  !isLoadingMore &&
  metrics.clientHeight > 0 &&
  metrics.scrollHeight <= metrics.clientHeight;
