import { useState, useEffect } from "react";
import { apiFetch } from "../lib/api";

interface Repo {
  id: number;
  fullName: string;
  private: boolean;
  owner: string;
  name: string;
}

interface Workflow {
  id: number;
  name: string;
  path: string;
}

interface WatchedRepo {
  owner: string;
  repo: string;
  workflowIds: number[];
}

function RepoCard({
  repo,
  watched,
  onSaved,
}: {
  repo: Repo;
  watched: WatchedRepo | undefined;
  onSaved: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loadingWorkflows, setLoadingWorkflows] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);

  const isWatched = watched !== undefined;

  useEffect(() => {
    if (expanded && workflows.length === 0) {
      setLoadingWorkflows(true);
      apiFetch<{ workflows: Workflow[] }>(
        `/repos/${repo.owner}/${repo.name}/workflows`,
      )
        .then((data) => {
          setWorkflows(data.workflows);
          if (watched) {
            setSelected(new Set(watched.workflowIds));
          }
        })
        .catch(() => {})
        .finally(() => setLoadingWorkflows(false));
    }
  }, [expanded, repo.owner, repo.name, watched, workflows.length]);

  useEffect(() => {
    if (watched) {
      setSelected(new Set(watched.workflowIds));
    }
  }, [watched]);

  function toggleWorkflow(id: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAll() {
    setSelected(new Set(workflows.map((w) => w.id)));
  }

  function deselectAll() {
    setSelected(new Set());
  }

  async function save() {
    setSaving(true);
    try {
      await apiFetch("/repos/watch", {
        method: "POST",
        body: JSON.stringify({
          owner: repo.owner,
          repo: repo.name,
          workflowIds: Array.from(selected),
        }),
      });
      onSaved();
    } catch {
      // error handled by apiFetch
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    setRemoving(true);
    try {
      await apiFetch(`/repos/watch/${repo.owner}/${repo.name}`, {
        method: "DELETE",
      });
      setSelected(new Set());
      onSaved();
    } catch {
      // error handled by apiFetch
    } finally {
      setRemoving(false);
    }
  }

  return (
    <div className="rounded-md border border-[#30363d] bg-[#161b22]">
      {/* Collapsed header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-[#1c2128]"
      >
        <i
          className={`fa-solid fa-chevron-right text-xs text-[#8b949e] transition-transform duration-150 ${expanded ? "rotate-90" : ""}`}
        />
        <span className="flex-1 text-sm font-medium text-[#e6edf3]">
          {repo.fullName}
        </span>
        {repo.private && (
          <span className="rounded-md bg-[#30363d] px-1.5 py-0.5 text-[10px] font-medium text-[#8b949e]">
            Private
          </span>
        )}
        {isWatched && (
          <span className="h-2 w-2 rounded-full bg-[#58a6ff]" title="Watched" />
        )}
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-[#30363d] px-4 py-3">
          {loadingWorkflows ? (
            <div className="flex items-center gap-2 py-4 text-sm text-[#8b949e]">
              <i className="fa-solid fa-spinner fa-spin" />
              Loading workflows...
            </div>
          ) : workflows.length === 0 ? (
            <p className="py-2 text-sm text-[#8b949e]">
              No workflows found in this repo.
            </p>
          ) : (
            <>
              {/* Select controls */}
              <div className="mb-3 flex gap-3 text-xs">
                <button
                  onClick={selectAll}
                  className="text-[#58a6ff] hover:underline"
                >
                  Select all
                </button>
                <button
                  onClick={deselectAll}
                  className="text-[#58a6ff] hover:underline"
                >
                  Deselect all
                </button>
              </div>

              {/* Workflow checkboxes */}
              <div className="space-y-2">
                {workflows.map((wf) => (
                  <label
                    key={wf.id}
                    className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-1.5 hover:bg-[#1c2128]"
                  >
                    <input
                      type="checkbox"
                      checked={selected.has(wf.id)}
                      onChange={() => toggleWorkflow(wf.id)}
                      className="h-4 w-4 rounded border-[#30363d] bg-[#0d1117] accent-[#58a6ff]"
                    />
                    <span className="text-sm text-[#e6edf3]">{wf.name}</span>
                    <span className="font-mono text-xs text-[#8b949e]">
                      {wf.path}
                    </span>
                  </label>
                ))}
              </div>

              {/* Actions */}
              <div className="mt-4 flex items-center gap-3">
                <button
                  onClick={save}
                  disabled={saving || selected.size === 0}
                  className="flex items-center gap-2 rounded-md bg-[#238636] px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-[#2ea043] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving && <i className="fa-solid fa-spinner fa-spin" />}
                  {isWatched ? "Update" : "Save"}
                </button>
                {isWatched && (
                  <button
                    onClick={remove}
                    disabled={removing}
                    className="flex items-center gap-2 rounded-md border border-[#30363d] bg-transparent px-4 py-1.5 text-sm text-[#f85149] transition-colors hover:border-[#f85149]/40 hover:bg-[#f85149]/10 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {removing && <i className="fa-solid fa-spinner fa-spin" />}
                    Remove
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export function Setup() {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [watchedRepos, setWatchedRepos] = useState<WatchedRepo[]>([]);
  const [loading, setLoading] = useState(true);

  function fetchAll() {
    Promise.all([
      apiFetch<{ repos: Repo[] }>("/repos/available"),
      apiFetch<{ repos: WatchedRepo[] }>("/repos/watched"),
    ])
      .then(([available, watched]) => {
        setRepos(available.repos);
        setWatchedRepos(watched.repos);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchAll();
  }, []);

  function findWatched(repo: Repo): WatchedRepo | undefined {
    return watchedRepos.find(
      (w) => w.owner === repo.owner && w.repo === repo.name,
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-xl font-semibold text-[#e6edf3]">
        Setup Watched Repos
      </h1>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-12 animate-pulse rounded-md border border-[#30363d] bg-[#161b22]"
            />
          ))}
        </div>
      ) : repos.length === 0 ? (
        <div className="rounded-md border border-[#30363d] bg-[#161b22] px-6 py-12 text-center">
          <i className="fa-solid fa-folder-open mb-3 text-3xl text-[#30363d]" />
          <p className="text-[#e6edf3]">No repositories found</p>
          <p className="mt-1 text-sm text-[#8b949e]">
            Make sure your GitHub account has access to repositories with
            Actions workflows.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {repos.map((repo) => (
            <RepoCard
              key={repo.id}
              repo={repo}
              watched={findWatched(repo)}
              onSaved={fetchAll}
            />
          ))}
        </div>
      )}
    </div>
  );
}
