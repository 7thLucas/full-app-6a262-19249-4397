import { useCallback, useEffect, useState } from "react";
import { fetchSessions } from "../libs/audio-analyzer.client";
import type { PersistedSession } from "../libs/audio-analyzer.client";

export type UseSessionsState = {
  sessions: PersistedSession[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
};

export function useSessions(): UseSessionsState {
  const [sessions, setSessions] = useState<PersistedSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchKey, setFetchKey] = useState(0);

  const refetch = useCallback(() => {
    setFetchKey((k) => k + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    setIsLoading(true);
    setError(null);

    fetchSessions({ signal: controller.signal })
      .then((data) => {
        if (!cancelled) {
          setSessions(data);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : "Failed to load sessions";
          setError(message);
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [fetchKey]);

  return { sessions, isLoading, error, refetch };
}
