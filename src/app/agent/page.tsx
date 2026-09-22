"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { closeBrowser, getBrowserStatus, openBrowser, startRun } from "@/lib/api";

const EXAMPLE_INSTRUCTIONS = `Go to the website.

Login to my account.

Open Mobile Phones.

Select Lahore.

Open each listing.

Extract the title, date, description, seller name, address and contact number.

For the contact number, click the "Show Phone Number" button and extract the number displayed on the page.

Add all information to CSV.`;

export default function AgentPage() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [instructions, setInstructions] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [browserOpen, setBrowserOpen] = useState(false);
  const [browserBusy, setBrowserBusy] = useState(false);
  const [browserError, setBrowserError] = useState<string | null>(null);
  const [browserMode, setBrowserMode] = useState<'attach' | 'launch'>('attach');

  useEffect(() => {
    getBrowserStatus()
      .then((s) => {
        setBrowserOpen(s.open);
        setBrowserMode(s.mode ?? 'attach');
      })
      .catch(() => undefined);
  }, []);

  async function handleOpenBrowser() {
    setBrowserError(null);
    setBrowserBusy(true);
    try {
      await openBrowser(url || undefined);
      setBrowserOpen(true);
    } catch (err) {
      setBrowserError(err instanceof Error ? err.message : "Failed to open browser");
    } finally {
      setBrowserBusy(false);
    }
  }

  async function handleCloseBrowser() {
    setBrowserError(null);
    setBrowserBusy(true);
    try {
      await closeBrowser();
      setBrowserOpen(false);
    } catch (err) {
      setBrowserError(err instanceof Error ? err.message : "Failed to close browser");
    } finally {
      setBrowserBusy(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);
    setSubmitting(true);
    try {
      const result = await startRun({
        url,
        username: username || undefined,
        password: password || undefined,
        instructions,
      });
      setPassword("");
      router.push(`/agent/${result.runId}`);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to start agent");
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-10">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">AI Browser Data Extraction Agent</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Describe what to do in plain English. The agent inspects the live page itself — nothing about a
          specific website is hardcoded.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <fieldset disabled={submitting || browserBusy} className="flex flex-col gap-6 disabled:opacity-60">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="url" className="text-sm font-medium">
              Website URL
            </label>
            <input
              id="url"
              type="url"
              required
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900"
            />
          </div>

          <div className="flex flex-col gap-2 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium">
                  {browserMode === "launch" ? "Server browser" : "Your browser"}
                </p>
                <p className="mt-1 text-xs text-zinc-500">
                  {browserMode === "launch"
                    ? "This backend runs its own browser on the server, so it can't use your logged-in session. Fill in the login below if the site needs one — and note it can't solve a CAPTCHA or OTP."
                    : browserOpen
                      ? "Connected. The agent will use your open tab for this site — your login, cookies and session stay as they are, and the browser is never closed."
                      : "The agent drives your own browser, never an isolated one. Click Open Browser, or start Chrome yourself with --remote-debugging-port=9222 and a --user-data-dir."}
                </p>
              </div>
              {browserMode === "attach" && (
                <button
                  type="button"
                  onClick={browserOpen ? handleCloseBrowser : handleOpenBrowser}
                  disabled={browserBusy}
                  className="shrink-0 rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
                >
                  {browserBusy ? "Working..." : browserOpen ? "Close Browser" : "Open Browser"}
                </button>
              )}
            </div>
            {browserError && <p className="text-xs text-red-600 dark:text-red-400">{browserError}</p>}
          </div>

          <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
            <p className="mb-3 text-sm font-medium">
              Login (optional — if your instructions include logging in but you leave this empty, the
              agent will pause and let you log in yourself in the browser window, then you click Continue)
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="username" className="text-sm text-zinc-600 dark:text-zinc-400">
                  Username / Email
                </label>
                <input
                  id="username"
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="password" className="text-sm text-zinc-600 dark:text-zinc-400">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 pr-9 text-sm shadow-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute inset-y-0 right-0 flex w-9 items-center justify-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-baseline justify-between">
              <label htmlFor="instructions" className="text-sm font-medium">
                Instructions
              </label>
              <button
                type="button"
                onClick={() => setInstructions(EXAMPLE_INSTRUCTIONS)}
                className="text-xs text-zinc-500 underline hover:text-zinc-700 dark:hover:text-zinc-300"
              >
                Fill example
              </button>
            </div>
            <textarea
              id="instructions"
              required
              rows={12}
              placeholder="Go to the website, log in, open Mobile Phones, select Lahore..."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="rounded-md border border-zinc-300 bg-white px-3 py-2 font-mono text-sm shadow-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900"
            />
          </div>

          <button
            type="submit"
            className="flex w-fit items-center gap-2 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            {submitting && (
              <span className="h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent" />
            )}
            {submitting ? "Starting..." : "Start Agent"}
          </button>
        </fieldset>
      </form>

      {submitError && (
        <p className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          {submitError}
        </p>
      )}
    </div>
  );
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1.5 12S5 5 12 5s10.5 7 10.5 7-3.5 7-10.5 7S1.5 12 1.5 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3l18 18" />
      <path d="M10.6 5.1A10.9 10.9 0 0 1 12 5c7 0 10.5 7 10.5 7a13.5 13.5 0 0 1-3.1 4.1M6.5 6.6C3.4 8.5 1.5 12 1.5 12s3.5 7 10.5 7a10.6 10.6 0 0 0 4.1-.8" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
    </svg>
  );
}
