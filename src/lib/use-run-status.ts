"use client";

import { useEffect, useRef, useState } from "react";
import { API_BASE_URL } from "./api";
import { isTerminalStatus, type RunEventPayload, type RunRow, type SseMessage } from "./run-types";

export interface RunStatusState {
  run: RunRow | null;
  log: RunEventPayload[];
  checklist: string[];
  paused: boolean;
  pauseMessage: string | null;
  connected: boolean;
}

const INITIAL_STATE: RunStatusState = {
  run: null,
  log: [],
  checklist: [],
  paused: false,
  pauseMessage: null,
  connected: false,
};

function dedupe(items: string[]): string[] {
  return Array.from(new Set(items));
}

function applyStatusMetadata(run: RunRow | null, event: RunEventPayload): RunRow | null {
  const status = event.metadata?.status as RunRow["status"] | undefined;
  if (!run || !status) return run;
  return { ...run, status };
}

function applyCounterMetadata(run: RunRow | null, event: RunEventPayload): RunRow | null {
  if (!run || event.type !== "COUNTER_UPDATE" || !event.metadata) return run;
  const meta = event.metadata as Record<string, number>;
  return {
    ...run,
    extractedCount: meta.extractedCount ?? run.extractedCount,
    failedCount: meta.failedCount ?? run.failedCount,
    progressCurrent: meta.progressCurrent ?? run.progressCurrent,
    progressTotal: meta.progressTotal ?? run.progressTotal,
  };
}

function applyMessage(prev: RunStatusState, message: SseMessage, close: () => void): RunStatusState {
  if (message.kind === "snapshot") {
    const { run, events } = message.payload;
    const checklist = dedupe(events.filter((e) => e.type === "CHECKLIST_UPDATE").map((e) => e.message));
    const lastPauseOrResume = [...events].reverse().find((e) => e.type === "PAUSE" || e.type === "RESUMED");
    const paused = lastPauseOrResume?.type === "PAUSE";

    if (run && isTerminalStatus(run.status)) close();

    return {
      run,
      log: events.filter((e) => e.type !== "COUNTER_UPDATE"),
      checklist,
      paused,
      pauseMessage: paused ? (lastPauseOrResume?.message ?? null) : null,
      connected: true,
    };
  }

  const event = message.payload;
  let run = applyStatusMetadata(prev.run, event);
  run = applyCounterMetadata(run, event);

  const checklist = event.type === "CHECKLIST_UPDATE" ? dedupe([...prev.checklist, event.message]) : prev.checklist;
  const log = event.type === "COUNTER_UPDATE" ? prev.log : [...prev.log, event];
  const paused = event.type === "PAUSE" ? true : event.type === "RESUMED" ? false : prev.paused;
  const pauseMessage = event.type === "PAUSE" ? event.message : event.type === "RESUMED" ? null : prev.pauseMessage;

  if (run && isTerminalStatus(run.status)) close();

  return { ...prev, run, log, checklist, paused, pauseMessage, connected: true };
}

export function useRunStatus(runId: string | null): RunStatusState {
  const [state, setState] = useState<RunStatusState>(INITIAL_STATE);
  const sourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!runId) {
      setState(INITIAL_STATE);
      return;
    }

    setState(INITIAL_STATE);
    const source = new EventSource(`${API_BASE_URL}/agent/${runId}/events`);
    sourceRef.current = source;
    const close = () => source.close();

    source.onopen = () => setState((s) => ({ ...s, connected: true }));
    source.onmessage = (evt) => {
      try {
        const message: SseMessage = JSON.parse(evt.data);
        setState((prev) => applyMessage(prev, message, close));
      } catch {
        // ignore malformed frame
      }
    };
    source.onerror = () => setState((s) => ({ ...s, connected: false }));

    return () => {
      source.close();
      sourceRef.current = null;
    };
  }, [runId]);

  return state;
}
