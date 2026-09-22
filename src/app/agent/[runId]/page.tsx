"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { cancelRun, continueRun } from "@/lib/api";
import { useRunStatus } from "@/lib/use-run-status";
import { isTerminalStatus } from "@/lib/run-types";

export default function AgentRunPage() {
  const { runId } = useParams<{ runId: string }>();
  const status = useRunStatus(runId);
  const { run, log, checklist, paused, pauseMessage } = status;
  const lastActionMessage = [...log].reverse().find((e) => e.type !== "CHECKLIST_UPDATE")?.message;
  const isActive = !run || !isTerminalStatus(run.status);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-10">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Agent Run</h1>
          <p className="mt-1 text-sm text-zinc-500">Live progress for this extraction run.</p>
        </div>
        <Link
          href="/agent"
          className="shrink-0 rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
        >
          Start new run
        </Link>
      </header>

      <section className="flex flex-col gap-4 rounded-lg border border-zinc-200 p-5 dark:border-zinc-800">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-zinc-500">
            {isActive && <Spinner />}
            Agent {run?.status ?? "Starting"}
          </h2>
          <div className="flex gap-2">
            {run && !isTerminalStatus(run.status) && (
              <button
                onClick={() => cancelRun(runId)}
                className="rounded-md border border-zinc-300 px-3 py-1 text-xs font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        {!run && (
          <p className="flex items-center gap-2 text-sm text-zinc-500">
            <Spinner />
            Connecting to agent…
          </p>
        )}

        {paused && (
          <div className="flex flex-col gap-2 rounded-md border border-amber-300 bg-amber-50 p-4 text-sm dark:border-amber-800 dark:bg-amber-950">
            <p className="font-medium text-amber-800 dark:text-amber-200">Agent paused</p>
            <p className="text-amber-700 dark:text-amber-300">{pauseMessage}</p>
            <button
              onClick={() => continueRun(runId)}
              className="w-fit rounded-md bg-amber-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-700"
            >
              Continue
            </button>
          </div>
        )}

        {checklist.length > 0 && (
          <ul className="flex flex-col gap-1 text-sm">
            {checklist.map((item) => (
              <li key={item} className="text-green-700 dark:text-green-400">
                ✓ {item}
              </li>
            ))}
          </ul>
        )}

        {run && (
          <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
            <Stat label="Progress" value={`${run.progressCurrent} / ${run.progressTotal || "?"}`} />
            <Stat label="Extracted" value={String(run.extractedCount)} />
            <Stat label="Failed" value={String(run.failedCount)} />
            <Stat label="Status" value={run.status} />
          </div>
        )}

        {lastActionMessage && !paused && (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            <span className="font-medium">Current action: </span>
            {lastActionMessage}
          </p>
        )}

        <div>
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-zinc-500">Activity log</p>
          <div className="max-h-64 overflow-y-auto rounded-md border border-zinc-200 bg-zinc-50 p-3 font-mono text-xs dark:border-zinc-800 dark:bg-zinc-950">
            {log.length === 0 && (
              <p className="flex items-center gap-2 text-zinc-400">
                {isActive && <Spinner className="h-3 w-3" />}
                Waiting for activity...
              </p>
            )}
            {log.map((event) => (
              <p key={event.id} className={event.type === "ERROR" || event.type === "STEP_FAILED" ? "text-red-500" : ""}>
                {event.message}
              </p>
            ))}
          </div>
        </div>

        {run?.status === "COMPLETED" && (
          <p className="text-sm text-zinc-500">
            Done — see the <Link href="/results" className="underline">Results</Link> page to view and download the CSV.
          </p>
        )}
        {run?.status === "FAILED" && run.errorMessage && (
          <p className="text-sm text-red-600 dark:text-red-400">{run.errorMessage}</p>
        )}
        <p className="text-xs text-zinc-400">Run ID: {runId}</p>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-zinc-200 px-3 py-2 dark:border-zinc-800">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="text-sm font-semibold">{value}</p>
    </div>
  );
}

function Spinner({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={`inline-block shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent text-zinc-400 ${className}`}
    />
  );
}
