/**
 * Whether the user has asked to economise on data — Save-Data on the network
 * connection, or the `prefers-reduced-data` media query. When true, the
 * Background shows the lightweight static .jpg instead of fetching the
 * multi-megabyte animated source, even while playing.
 */
export const prefersReducedData = (): boolean => {
  try {
    const connection = (
      navigator as Navigator & { connection?: { saveData?: boolean } }
    ).connection;
    if (connection?.saveData) return true;

    return (
      window.matchMedia?.("(prefers-reduced-data: reduce)")?.matches ?? false
    );
  } catch {
    // Defensive: NetworkInformation / matchMedia aren't universally supported.
    return false;
  }
};
