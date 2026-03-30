import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../lib/api";

interface WorkflowRun {
  id: number;
  workflowName: string;
  runNumber: number;
  status: string;
  conclusion: string | null;
  branch: string;
  commitMessage: string | null;
  repoFullName: string;
  htmlUrl: string;
  createdAt: string;
}

function statusIcon(
  status: string,
  conclusion: string | null,
): { icon: string; color: string; animate: boolean } {
  if (status === "completed") {
    switch (conclusion) {
      case "success":
        return {
          icon: "fa-solid fa-circle-check",
          color: "#3fb950",
          animate: false,
        };
      case "failure":
        return {
          icon: "fa-solid fa-circle-xmark",
          color: "#f85149",
          animate: false,
        };
      case "cancelled":
        return { icon: "fa-solid fa-ban", color: "#8b949e", animate: false };
      default:
        return {
          icon: "fa-solid fa-circle-question",
          color: "#8b949e",
          animate: false,
        };
    }
  }
  if (status === "in_progress") {
    return {
      icon: "fa-solid fa-circle-dot",
      color: "#d29922",
      animate: true,
    };
  }
  if (status === "queued" || status === "waiting" || status === "pending") {
    return { icon: "fa-regular fa-clock", color: "#8b949e", animate: false };
  }
  return {
    icon: "fa-solid fa-circle-question",
    color: "#8b949e",
    animate: false,
  };
}

function timeAgo(dateStr: string): string {
  const seconds = Math.floor(
    (Date.now() - new Date(dateStr).getTime()) / 1000,
  );
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function FailureCard({ run }: { run: WorkflowRun }) {
  return (
    <a
      href={run.htmlUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-md border border-[#f85149]/30 bg-[#161b22] p-4 transition-colors hover:border-[#f85149]/60 hover:bg-[#1c2128]"
    >
      <div className="mb-2 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <i className="fa-solid fa-circle-xmark text-[#f85149]" />
          <span className="text-sm font-semibold text-[#e6edf3]">
            {run.workflowName}
          </span>
          <span className="text-xs text-[#8b949e]">#{run.runNumber}</span>
        </div>
        <span className="shrink-0 text-xs text-[#8b949e]">
          {timeAgo(run.createdAt)}
        </span>
      </div>
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span className="text-xs text-[#8b949e]">{run.repoFullName}</span>
        <span className="rounded-full bg-[#1c3a5f] px-2 py-0.5 text-xs text-[#58a6ff]">
          {run.branch}
        </span>
      </div>
      {run.commitMessage && (
        <p className="truncate text-xs text-[#8b949e]">
          <i className="fa-solid fa-code-commit mr-1 text-[10px]" />
          {run.commitMessage}
        </p>
      )}
    </a>
  );
}

function CompactRunRow({ run, border }: { run: WorkflowRun; border: boolean }) {
  const si = statusIcon(run.status, run.conclusion);
  return (
    <a
      href={run.htmlUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex items-center gap-2 px-3 py-2 transition-colors hover:bg-[#1c2128] ${border ? "border-t border-[#30363d]" : ""}`}
    >
      <i
        className={`${si.icon} text-sm ${si.animate ? "animate-pulse" : ""}`}
        style={{ color: si.color }}
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="truncate text-xs font-medium text-[#e6edf3]">
            {run.workflowName}
          </span>
          <span className="shrink-0 text-[10px] text-[#8b949e]">
            #{run.runNumber}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="truncate text-[10px] text-[#8b949e]">
            {run.repoFullName}
          </span>
          <span className="shrink-0 text-[10px] text-[#58a6ff]">
            {run.branch}
          </span>
        </div>
      </div>
      <span className="shrink-0 text-[10px] text-[#8b949e]">
        {timeAgo(run.createdAt)}
      </span>
    </a>
  );
}

export function Dashboard() {
  const [runs, setRuns] = useState<WorkflowRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRuns = useCallback(() => {
    apiFetch<{ runs: WorkflowRun[] }>("/workflows/runs")
      .then((data) => {
        setRuns(data.runs);
        setError(null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchRuns();
    const interval = setInterval(fetchRuns, 30_000);
    return () => clearInterval(interval);
  }, [fetchRuns]);

  const failures = runs.filter(
    (r) => r.status === "completed" && r.conclusion === "failure",
  );

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-[#e6edf3]">Dashboard</h1>
        <button
          onClick={() => {
            setLoading(true);
            fetchRuns();
          }}
          className="flex items-center gap-2 rounded-md border border-[#30363d] bg-[#21262d] px-3 py-1.5 text-sm text-[#e6edf3] transition-colors hover:border-[#8b949e] hover:bg-[#30363d]"
        >
          <i
            className={`fa-solid fa-arrows-rotate ${loading ? "fa-spin" : ""}`}
          />
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-md border border-[#f85149]/40 bg-[#f85149]/10 px-4 py-3 text-sm text-[#f85149]">
          {error}
        </div>
      )}

      {loading && runs.length === 0 && (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-16 animate-pulse rounded-md border border-[#30363d] bg-[#161b22]"
            />
          ))}
        </div>
      )}

      {!loading && runs.length === 0 && !error && (
        <div className="rounded-md border border-[#30363d] bg-[#161b22] px-6 py-12 text-center">
          <i className="fa-solid fa-inbox mb-3 text-3xl text-[#30363d]" />
          <p className="mb-2 text-[#e6edf3]">No workflow runs yet</p>
          <p className="mb-4 text-sm text-[#8b949e]">
            Set up repos and workflows to start monitoring.
          </p>
          <Link
            to="/setup"
            className="inline-flex items-center gap-2 rounded-md bg-[#238636] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#2ea043]"
          >
            <i className="fa-solid fa-gear" />
            Go to Setup
          </Link>
        </div>
      )}

      {runs.length > 0 && (
        <div className="flex gap-4">
          {/* Left: Failures */}
          <div className="min-w-0 flex-1">
            <div className="mb-3 flex items-center gap-2">
              <i className="fa-solid fa-circle-xmark text-sm text-[#f85149]" />
              <h2 className="text-sm font-semibold text-[#e6edf3]">
                Failures
              </h2>
              {failures.length > 0 && (
                <span className="rounded-full bg-[#f85149]/15 px-2 py-0.5 text-xs font-medium text-[#f85149]">
                  {failures.length}
                </span>
              )}
            </div>
            {failures.length === 0 ? (
              <div className="rounded-md border border-[#30363d] bg-[#161b22] px-6 py-10 text-center">
                <i className="fa-solid fa-circle-check mb-2 text-2xl text-[#3fb950]" />
                <p className="text-sm text-[#e6edf3]">All clear</p>
                <p className="mt-1 text-xs text-[#8b949e]">
                  No failed workflow runs.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {failures.map((run) => (
                  <FailureCard key={run.id} run={run} />
                ))}
              </div>
            )}
          </div>

          {/* Right: All runs */}
          <div className="hidden w-[30%] shrink-0 lg:block">
            <div className="mb-3 flex items-center gap-2">
              <i className="fa-solid fa-list text-sm text-[#8b949e]" />
              <h2 className="text-sm font-semibold text-[#e6edf3]">
                All Runs
              </h2>
              <span className="rounded-full bg-[#30363d] px-2 py-0.5 text-xs text-[#8b949e]">
                {runs.length}
              </span>
            </div>
            <div className="overflow-hidden rounded-md border border-[#30363d] bg-[#161b22]">
              <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
                {runs.map((run, idx) => (
                  <CompactRunRow key={run.id} run={run} border={idx > 0} />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
