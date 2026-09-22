export type RunStatus =
  | "PENDING"
  | "PLANNING"
  | "RUNNING"
  | "PAUSED_CAPTCHA"
  | "PAUSED_OTP"
  | "PAUSED_LOGIN"
  | "COMPLETED"
  | "FAILED"
  | "CANCELLED";

export type RunEventType =
  | "LOG"
  | "STEP_START"
  | "STEP_COMPLETE"
  | "STEP_FAILED"
  | "CHECKLIST_UPDATE"
  | "COUNTER_UPDATE"
  | "PAUSE"
  | "RESUMED"
  | "ERROR";

export interface RunRow {
  id: string;
  targetUrl: string;
  status: RunStatus;
  currentStepLabel: string | null;
  progressCurrent: number;
  progressTotal: number;
  extractedCount: number;
  failedCount: number;
  errorMessage: string | null;
  fieldList: string[];
}

export interface RunEventPayload {
  id: string;
  runId: string;
  type: RunEventType;
  message: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export type SseMessage =
  | { kind: "snapshot"; payload: { run: RunRow | null; events: RunEventPayload[] } }
  | { kind: "event"; payload: RunEventPayload };

const TERMINAL_STATUSES: RunStatus[] = ["COMPLETED", "FAILED", "CANCELLED"];

export function isTerminalStatus(status: RunStatus | undefined): boolean {
  return !!status && TERMINAL_STATUSES.includes(status);
}
