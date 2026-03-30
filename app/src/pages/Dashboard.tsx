import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../lib/api";

function getSplitRatio(): number {
  const cookie = document.cookie.match(/(?:^|; )ghw_split=([^;]*)/);
  const val = cookie ? parseFloat(cookie[1]) : NaN;
  return val >= 20 && val <= 80 ? val : 70;
}

function saveSplitRatio(ratio: number) {
  document.cookie = `ghw_split=${ratio.toFixed(1)};path=/;max-age=${365 * 24 * 60 * 60}`;
}

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
          color: "var(--ghw-green)",
          animate: false,
        };
      case "failure":
        return {
          icon: "fa-solid fa-circle-xmark",
          color: "var(--ghw-red)",
          animate: false,
        };
      case "cancelled":
        return { icon: "fa-solid fa-ban", color: "var(--ghw-text-muted)", animate: false };
      default:
        return {
          icon: "fa-solid fa-circle-question",
          color: "var(--ghw-text-muted)",
          animate: false,
        };
    }
  }
  if (status === "in_progress") {
    return {
      icon: "fa-solid fa-circle-dot",
      color: "var(--ghw-yellow)",
      animate: true,
    };
  }
  if (status === "queued" || status === "waiting" || status === "pending") {
    return { icon: "fa-regular fa-clock", color: "var(--ghw-text-muted)", animate: false };
  }
  return {
    icon: "fa-solid fa-circle-question",
    color: "var(--ghw-text-muted)",
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
      className="block rounded-md border p-4 transition-colors"
      style={{
        borderColor: "color-mix(in srgb, var(--ghw-red) 30%, transparent)",
        backgroundColor: "var(--ghw-bg-card)",
      }}
    >
      <div className="mb-2 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <i className="fa-solid fa-circle-xmark" style={{ color: "var(--ghw-red)" }} />
          <span className="text-sm font-semibold" style={{ color: "var(--ghw-text)" }}>
            {run.workflowName}
          </span>
          <span className="text-xs" style={{ color: "var(--ghw-text-muted)" }}>#{run.runNumber}</span>
        </div>
        <span className="shrink-0 text-xs" style={{ color: "var(--ghw-text-muted)" }}>
          {timeAgo(run.createdAt)}
        </span>
      </div>
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span className="text-xs" style={{ color: "var(--ghw-text-muted)" }}>{run.repoFullName}</span>
        <span
          className="rounded-full px-2 py-0.5 text-xs"
          style={{ backgroundColor: "var(--ghw-bg-elevated)", color: "var(--ghw-blue)" }}
        >
          {run.branch}
        </span>
      </div>
      {run.commitMessage && (
        <p className="truncate text-xs" style={{ color: "var(--ghw-text-muted)" }}>
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
      className="flex items-center gap-2 px-3 py-2 transition-colors"
      style={{
        borderTop: border ? "1px solid var(--ghw-border)" : "none",
      }}
    >
      <i
        className={`${si.icon} text-sm ${si.animate ? "animate-pulse" : ""}`}
        style={{ color: si.color }}
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="truncate text-xs font-medium" style={{ color: "var(--ghw-text)" }}>
            {run.workflowName}
          </span>
          <span className="shrink-0 text-[10px]" style={{ color: "var(--ghw-text-muted)" }}>
            #{run.runNumber}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="truncate text-[10px]" style={{ color: "var(--ghw-text-muted)" }}>
            {run.repoFullName}
          </span>
          <span className="shrink-0 text-[10px]" style={{ color: "var(--ghw-blue)" }}>
            {run.branch}
          </span>
        </div>
      </div>
      <span className="shrink-0 text-[10px]" style={{ color: "var(--ghw-text-muted)" }}>
        {timeAgo(run.createdAt)}
      </span>
    </a>
  );
}

export function Dashboard() {
  const [runs, setRuns] = useState<WorkflowRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [splitRatio, setSplitRatio] = useState(getSplitRatio);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

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

  useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      if (!dragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const ratio = ((e.clientX - rect.left) / rect.width) * 100;
      const clamped = Math.min(80, Math.max(20, ratio));
      setSplitRatio(clamped);
    }
    function onMouseUp() {
      if (dragging.current) {
        dragging.current = false;
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
        setSplitRatio((r) => {
          saveSplitRatio(r);
          return r;
        });
      }
    }
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  function startDrag(e: React.MouseEvent) {
    e.preventDefault();
    dragging.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }

  const failures = runs.filter(
    (r) => r.status === "completed" && r.conclusion === "failure",
  );

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold" style={{ color: "var(--ghw-text)" }}>Dashboard</h1>
        <button
          onClick={() => {
            setLoading(true);
            fetchRuns();
          }}
          className="flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm transition-colors"
          style={{
            borderColor: "var(--ghw-border)",
            backgroundColor: "var(--ghw-bg-btn)",
            color: "var(--ghw-text)",
          }}
        >
          <i
            className={`fa-solid fa-arrows-rotate ${loading ? "fa-spin" : ""}`}
          />
          Refresh
        </button>
      </div>

      {error && (
        <div
          className="mb-4 rounded-md border px-4 py-3 text-sm"
          style={{
            borderColor: "color-mix(in srgb, var(--ghw-red) 40%, transparent)",
            backgroundColor: "color-mix(in srgb, var(--ghw-red) 10%, transparent)",
            color: "var(--ghw-red)",
          }}
        >
          {error}
        </div>
      )}

      {loading && runs.length === 0 && (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-16 animate-pulse rounded-md border"
              style={{ borderColor: "var(--ghw-border)", backgroundColor: "var(--ghw-bg-card)" }}
            />
          ))}
        </div>
      )}

      {!loading && runs.length === 0 && !error && (
        <div
          className="rounded-md border px-6 py-12 text-center"
          style={{ borderColor: "var(--ghw-border)", backgroundColor: "var(--ghw-bg-card)" }}
        >
          <i className="fa-solid fa-inbox mb-3 text-3xl" style={{ color: "var(--ghw-border)" }} />
          <p className="mb-2" style={{ color: "var(--ghw-text)" }}>No workflow runs yet</p>
          <p className="mb-4 text-sm" style={{ color: "var(--ghw-text-muted)" }}>
            Set up repos and workflows to start monitoring.
          </p>
          <Link
            to="/setup"
            className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white transition-colors"
            style={{ backgroundColor: "var(--ghw-btn-green)" }}
          >
            <i className="fa-solid fa-gear" />
            Go to Setup
          </Link>
        </div>
      )}

      {runs.length > 0 && (
        <div ref={containerRef} className="flex" style={{ gap: 0 }}>
          {/* Left: Failures */}
          <div className="min-w-0 overflow-hidden" style={{ width: `${splitRatio}%` }}>
            <div className="mb-3 flex items-center gap-2">
              <i className="fa-solid fa-circle-xmark text-sm" style={{ color: "var(--ghw-red)" }} />
              <h2 className="text-sm font-semibold" style={{ color: "var(--ghw-text)" }}>
                Failures
              </h2>
              {failures.length > 0 && (
                <span
                  className="rounded-full px-2 py-0.5 text-xs font-medium"
                  style={{
                    backgroundColor: "color-mix(in srgb, var(--ghw-red) 15%, transparent)",
                    color: "var(--ghw-red)",
                  }}
                >
                  {failures.length}
                </span>
              )}
            </div>
            <div className="pr-1">
              {failures.length === 0 ? (
                <div
                  className="rounded-md border px-6 py-10 text-center"
                  style={{ borderColor: "var(--ghw-border)", backgroundColor: "var(--ghw-bg-card)" }}
                >
                  <i className="fa-solid fa-circle-check mb-2 text-2xl" style={{ color: "var(--ghw-green)" }} />
                  <p className="text-sm" style={{ color: "var(--ghw-text)" }}>All clear</p>
                  <p className="mt-1 text-xs" style={{ color: "var(--ghw-text-muted)" }}>
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
          </div>

          {/* Drag handle */}
          <div
            onMouseDown={startDrag}
            className="hidden shrink-0 cursor-col-resize items-center justify-center lg:flex"
            style={{ width: "8px" }}
          >
            <div
              className="h-8 w-1 rounded-full"
              style={{ backgroundColor: "var(--ghw-border)" }}
            />
          </div>

          {/* Right: All runs */}
          <div className="hidden min-w-0 lg:block" style={{ width: `${100 - splitRatio}%` }}>
            <div className="mb-3 flex items-center gap-2">
              <i className="fa-solid fa-list text-sm" style={{ color: "var(--ghw-text-muted)" }} />
              <h2 className="text-sm font-semibold" style={{ color: "var(--ghw-text)" }}>
                All Runs
              </h2>
              <span
                className="rounded-full px-2 py-0.5 text-xs"
                style={{ backgroundColor: "var(--ghw-border)", color: "var(--ghw-text-muted)" }}
              >
                {runs.length}
              </span>
            </div>
            <div className="pl-1">
              <div
                className="overflow-hidden rounded-md border"
                style={{ borderColor: "var(--ghw-border)", backgroundColor: "var(--ghw-bg-card)" }}
              >
                <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
                  {runs.map((run, idx) => (
                    <CompactRunRow key={run.id} run={run} border={idx > 0} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
