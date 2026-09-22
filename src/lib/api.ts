export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

export interface StartRunPayload {
  url: string;
  username?: string;
  password?: string;
  instructions: string;
}

export async function startRun(payload: StartRunPayload): Promise<{ runId: string }> {
  const res = await fetch(`${API_BASE_URL}/agent/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? `Failed to start agent (${res.status})`);
  }
  return res.json();
}

export async function openBrowser(url?: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/agent/browser/open`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: url || undefined }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? `Failed to open browser (${res.status})`);
  }
}

export async function getBrowserStatus(): Promise<{ open: boolean; mode?: 'attach' | 'launch' }> {
  const res = await fetch(`${API_BASE_URL}/agent/browser/status`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to check browser status (${res.status})`);
  return res.json();
}

export async function closeBrowser(): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/agent/browser/close`, { method: "POST" });
  if (!res.ok) throw new Error(`Failed to close browser (${res.status})`);
}

export async function continueRun(runId: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/agent/${runId}/continue`, { method: "POST" });
  if (!res.ok) throw new Error(`Failed to continue run (${res.status})`);
}

export async function cancelRun(runId: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/agent/${runId}/cancel`, { method: "POST" });
  if (!res.ok) throw new Error(`Failed to cancel run (${res.status})`);
}

export interface ResultRow {
  runId: string;
  filename?: string;
  recordCount: number;
  createdAt: string;
  status: string;
  targetUrl: string;
}

export async function fetchResults(): Promise<ResultRow[]> {
  const res = await fetch(`${API_BASE_URL}/results`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load results (${res.status})`);
  return res.json();
}

export interface PreviewRow {
  id: string;
  listingUrl: string;
  data: Record<string, string>;
  truncatedFields: string[];
}

export interface PreviewResponse {
  columns: string[];
  rows: PreviewRow[];
  total: number;
  page: number;
  pageSize: number;
}

export async function fetchPreview(runId: string, page: number, pageSize = 20): Promise<PreviewResponse> {
  const res = await fetch(`${API_BASE_URL}/results/${runId}/preview?page=${page}&pageSize=${pageSize}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Failed to load preview (${res.status})`);
  return res.json();
}

export async function fetchListingDetail(runId: string, listingId: string): Promise<{ data: Record<string, string> }> {
  const res = await fetch(`${API_BASE_URL}/results/${runId}/listing/${listingId}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load listing (${res.status})`);
  return res.json();
}

export function downloadUrl(runId: string): string {
  return `${API_BASE_URL}/results/${runId}/download`;
}
