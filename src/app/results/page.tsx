"use client";

import { useEffect, useState } from "react";
import { downloadUrl, fetchListingDetail, fetchPreview, fetchResults, type PreviewResponse, type ResultRow } from "@/lib/api";

export default function ResultsPage() {
  const [results, setResults] = useState<ResultRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewingRunId, setViewingRunId] = useState<string | null>(null);

  useEffect(() => {
    fetchResults()
      .then(setResults)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load results"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-10">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Results</h1>
        <p className="mt-1 text-sm text-zinc-500">Generated CSV files from completed agent runs.</p>
      </header>

      {loading && <p className="text-sm text-zinc-500">Loading...</p>}
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      {!loading && !error && results.length === 0 && (
        <p className="text-sm text-zinc-500">
          No results yet. Start an agent run from the <a href="/agent" className="underline">Agent</a> page.
        </p>
      )}

      {results.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900">
              <tr>
                <th className="px-4 py-2.5">File</th>
                <th className="px-4 py-2.5">Records</th>
                <th className="px-4 py-2.5">Date</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {results.map((row) => (
                <tr key={row.runId} className="border-b border-zinc-100 last:border-0 dark:border-zinc-900">
                  <td className="px-4 py-2.5 font-mono text-xs">{row.filename ?? "—"}</td>
                  <td className="px-4 py-2.5">{row.recordCount}</td>
                  <td className="px-4 py-2.5">{new Date(row.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-2.5">{row.status}</td>
                  <td className="px-4 py-2.5 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setViewingRunId(row.runId)}
                        className="rounded-md border border-zinc-300 px-3 py-1 text-xs font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
                      >
                        View
                      </button>
                      <a
                        href={downloadUrl(row.runId)}
                        className="rounded-md bg-zinc-900 px-3 py-1 text-xs font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
                      >
                        Download CSV
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {viewingRunId && <CsvPreviewPanel runId={viewingRunId} onClose={() => setViewingRunId(null)} />}
    </div>
  );
}

function CsvPreviewPanel({ runId, onClose }: { runId: string; onClose: () => void }) {
  const [data, setData] = useState<PreviewResponse | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<{ listingId: string; field: string; value: string } | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchPreview(runId, page)
      .then(setData)
      .finally(() => setLoading(false));
  }, [runId, page]);

  async function openExpanded(listingId: string, field: string) {
    const detail = await fetchListingDetail(runId, listingId);
    setExpanded({ listingId, field, value: detail.data[field] ?? "" });
  }

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  return (
    <div className="fixed inset-0 z-10 flex items-start justify-center overflow-y-auto bg-black/40 p-6" onClick={onClose}>
      <div
        className="mt-10 w-full max-w-5xl rounded-lg bg-white p-5 shadow-xl dark:bg-zinc-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold">Preview</h3>
          <button onClick={onClose} className="text-sm text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200">
            Close
          </button>
        </div>

        {loading && <p className="text-sm text-zinc-500">Loading...</p>}

        {data && (
          <>
            <div className="overflow-x-auto rounded-md border border-zinc-200 dark:border-zinc-800">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-zinc-200 bg-zinc-50 uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950">
                  <tr>
                    {data.columns.map((col) => (
                      <th key={col} className="max-w-[180px] px-3 py-2">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.rows.map((row) => (
                    <tr key={row.id} className="border-b border-zinc-100 align-top last:border-0 dark:border-zinc-900">
                      {data.columns.map((col) => {
                        if (col === "listing_url") {
                          return (
                            <td key={col} className="max-w-[220px] truncate px-3 py-2">
                              <a href={row.listingUrl} target="_blank" rel="noreferrer" className="underline">
                                {row.listingUrl}
                              </a>
                            </td>
                          );
                        }
                        const truncated = row.truncatedFields.includes(col);
                        return (
                          <td key={col} className="max-w-[220px] px-3 py-2">
                            <span className="line-clamp-3">{row.data[col]}</span>
                            {truncated && (
                              <button
                                onClick={() => openExpanded(row.id, col)}
                                className="ml-1 text-zinc-400 underline hover:text-zinc-700 dark:hover:text-zinc-200"
                              >
                                expand
                              </button>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-3 flex items-center justify-between text-xs text-zinc-500">
              <span>
                {data.total} record(s) — page {data.page} of {totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="rounded-md border border-zinc-300 px-2 py-1 disabled:opacity-40 dark:border-zinc-700"
                >
                  Previous
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded-md border border-zinc-300 px-2 py-1 disabled:opacity-40 dark:border-zinc-700"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}

        {expanded && (
          <div
            className="fixed inset-0 z-20 flex items-center justify-center bg-black/50 p-6"
            onClick={() => setExpanded(null)}
          >
            <div
              className="max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-lg bg-white p-4 text-sm shadow-xl dark:bg-zinc-900"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="mb-2 text-xs font-semibold uppercase text-zinc-500">{expanded.field}</p>
              <p className="whitespace-pre-wrap">{expanded.value}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
