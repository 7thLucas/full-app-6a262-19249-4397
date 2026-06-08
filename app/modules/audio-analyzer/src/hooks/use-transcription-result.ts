import { useCallback, useEffect, useRef, useState } from "react";
import { getTranscriptionStatus, saveAnalysisSession } from "../libs/audio-analyzer.client";
import type { TrackTranscribeResult } from "../libs/types";

const DEFAULT_POLL_INTERVAL_MS = 2000;
const TERMINAL_STATUSES = new Set(["completed", "failed"]);

export type UseTranscriptionResultOptions = {
  pollIntervalMs?: number;
  enabled?: boolean;
  /** Filename to use when persisting the session (e.g. the original upload filename). */
  filename?: string;
};

export type UseTranscriptionResultState = {
  ticketId: string;
  result: TrackTranscribeResult | null;
  error: string | null;
  isLoading: boolean;
  isCompleted: boolean;
  isFailed: boolean;
  refetch: () => void;
};

export function useTranscriptionResult(
  ticketId: string,
  options: UseTranscriptionResultOptions = {},
): UseTranscriptionResultState {
  const pollIntervalMs = options.pollIntervalMs ?? DEFAULT_POLL_INTERVAL_MS;
  const enabled = options.enabled ?? true;

  const [result, setResult] = useState<TrackTranscribeResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pollKey, setPollKey] = useState(0);

  // Track whether we've already persisted this ticket so we don't double-save
  const savedRef = useRef(false);
  // Store latest filename in a ref to avoid stale closure issues
  const filenameRef = useRef(options.filename);
  filenameRef.current = options.filename;

  const refetch = useCallback(() => {
    setPollKey((key) => key + 1);
  }, []);

  useEffect(() => {
    if (!enabled || !ticketId) {
      return;
    }

    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout>;

    const poll = async () => {
      try {
        const data = await getTranscriptionStatus(ticketId);
        if (cancelled) {
          return;
        }
        setResult(data);
        setError(null);

        const status = data.status ?? "";
        if (TERMINAL_STATUSES.has(status)) {
          // Persist the session once on terminal status
          if (!savedRef.current && status === "completed") {
            savedRef.current = true;
            const filename =
              filenameRef.current ??
              data.audio_urls?.[0]?.split("/").pop() ??
              data.video_urls?.[0]?.split("/").pop() ??
              ticketId;

            // Compute duration from the last segment end time
            const segments = data.analysis?.segments ?? [];
            const durationMs =
              segments.length > 0
                ? Math.max(...segments.map((s) => s.end_ms ?? 0))
                : undefined;

            saveAnalysisSession({
              ticketId,
              filename,
              analysis: data.analysis,
              status,
              durationMs,
            }).catch((err) => {
              console.warn("Failed to persist analysis session:", err);
            });
          }
        } else {
          timeoutId = setTimeout(poll, pollIntervalMs);
        }
      } catch (err) {
        if (cancelled) {
          return;
        }
        const message = err instanceof Error ? err.message : "An error occurred";
        setError(message);
      }
    };

    savedRef.current = false;
    setResult(null);
    setError(null);
    poll();

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [ticketId, pollKey, pollIntervalMs, enabled]);

  const status = result?.status ?? null;

  return {
    ticketId,
    result,
    error,
    isLoading: result === null && error === null,
    isCompleted: status === "completed",
    isFailed: status === "failed",
    refetch,
  };
}
