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

  return (
    <div className="mx-auto max-w-4xl">
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

      {/* Error */}
      {error && (
        <div className="mb-4 rounded-md border border-[#f85149]/40 bg-[#f85149]/10 px-4 py-3 text-sm text-[#f85149]">
          {error}
        </div>
      )}

      {/* Loading skeleton */}
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

      {/* Empty state */}
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

      {/* Run list */}
      {runs.length > 0 && (
        <div className="overflow-hidden rounded-md border border-[#30363d]">
          {runs.map((run, idx) => {
            const si = statusIcon(run.status, run.conclusion);
            return (
              <a
                key={run.id}
                href={run.htmlUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`
                  flex items-center gap-3 bg-[#161b22] px-4 py-3 transition-colors
                  hover:bg-[#1c2128]
                  ${idx > 0 ? "border-t border-[#30363d]" : ""}
                `}
              >
                {/* Status icon */}
                <i
                  className={`${si.icon} text-base ${si.animate ? "animate-pulse-dot" : ""}`}
                  style={{ color: si.color }}
                />

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="text-sm font-semibold text-[#e6edf3]">
                      {run.workflowName}
                    </span>
                    <span className="text-xs text-[#8b949e]">
                      #{run.runNumber}
                    </span>
                    <span className="font-mono text-xs text-[#8b949e]">
                      {run.repoFullName}
                    </span>
                    <span className="rounded-full bg-[#1c3a5f] px-2 py-0.5 text-xs text-[#58a6ff]">
                      {run.branch}
                    </span>
                  </div>
                  {run.commitMessage && (
                    <p className="mt-0.5 truncate text-xs text-[#8b949e]">
                      {run.commitMessage}
                    </p>
                  )}
                </div>

                {/* Time */}
                <span className="shrink-0 text-xs text-[#8b949e]">
                  {timeAgo(run.createdAt)}
                </span>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
