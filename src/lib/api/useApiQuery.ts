"use client";

import { useCallback, useEffect, useState } from "react";

export type QueryState<T> =
  | { status: "loading"; data?: undefined; error?: undefined }
  | { status: "success"; data: T; error?: undefined }
  | { status: "error"; data?: undefined; error: unknown };

/**
 * Loads data for a component and re-runs when `key` changes. A null key skips
 * the request (e.g. when the user's role can't access it). Superseded requests
 * are aborted.
 */
export function useApiQuery<T>(
  key: string | null,
  fetcher: (signal: AbortSignal) => Promise<T>,
): QueryState<T> & { reload: () => void } {
  const [state, setState] = useState<{ key: string | null; value: QueryState<T> }>({
    key,
    value: { status: "loading" },
  });
  const [version, setVersion] = useState(0);

  // Reset to loading during render when the key changes, without an extra effect pass.
  if (state.key !== key) setState({ key, value: { status: "loading" } });

  useEffect(() => {
    if (key === null) return;
    const controller = new AbortController();
    fetcher(controller.signal).then(
      (data) => {
        if (!controller.signal.aborted) setState({ key, value: { status: "success", data } });
      },
      (error: unknown) => {
        if (!controller.signal.aborted) setState({ key, value: { status: "error", error } });
      },
    );
    return () => controller.abort();
    // `fetcher` is intentionally excluded: `key` identifies the request.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, version]);

  const reload = useCallback(() => {
    setState((s) => ({ ...s, value: { status: "loading" } }));
    setVersion((v) => v + 1);
  }, []);

  return { ...state.value, reload };
}
