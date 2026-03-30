import { useState, useEffect, useCallback } from "react";
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

interface WatchedWorkflow {
  workflowId: number;
  workflowName: string;
  workflowPath: string;
}

interface WatchedRepo {
  owner: string;
  repo: string;
  watchedWorkflows: WatchedWorkflow[];
}

function RepoCard({
  repo,
  checked,
  onToggleRepo,
  workflows,
  selectedWorkflows,
  onToggleWorkflow,
  onSelectAllWorkflows,
  onDeselectAllWorkflows,
  loadingWorkflows,
  onExpand,
}: {
  repo: Repo;
  checked: boolean;
  onToggleRepo: () => void;
  workflows: Workflow[] | null;
  selectedWorkflows: Set<number>;
  onToggleWorkflow: (id: number) => void;
  onSelectAllWorkflows: () => void;
  onDeselectAllWorkflows: () => void;
  loadingWorkflows: boolean;
  onExpand: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  function handleExpand() {
    const next = !expanded;
    setExpanded(next);
    if (next) onExpand();
  }

  return (
    <div
      className="rounded-md border"
      style={{ borderColor: "var(--ghw-border)", backgroundColor: "var(--ghw-bg-card)" }}
    >
      <div className="flex w-full items-center gap-3 px-4 py-3">
        <button
          onClick={handleExpand}
          className="flex flex-1 items-center gap-3 text-left transition-colors -my-3 -ml-4 py-3 pl-4 rounded-l-md"
        >
          <i
            className={`fa-solid fa-chevron-right text-xs transition-transform duration-150 ${expanded ? "rotate-90" : ""}`}
            style={{ color: "var(--ghw-text-muted)" }}
          />
          <span className="flex-1 text-sm font-medium" style={{ color: "var(--ghw-text)" }}>
            {repo.fullName}
          </span>
        </button>
        {repo.private && (
          <span
            className="rounded-md px-1.5 py-0.5 text-[10px] font-medium"
            style={{ backgroundColor: "var(--ghw-border)", color: "var(--ghw-text-muted)" }}
          >
            Private
          </span>
        )}
        <input
          type="checkbox"
          checked={checked}
          onChange={onToggleRepo}
          className="h-4 w-4 shrink-0 cursor-pointer rounded"
          style={{ accentColor: "var(--ghw-blue)" }}
        />
      </div>

      {expanded && (
        <div className="border-t px-4 py-3" style={{ borderColor: "var(--ghw-border)" }}>
          {loadingWorkflows ? (
            <div className="flex items-center gap-2 py-4 text-sm" style={{ color: "var(--ghw-text-muted)" }}>
              <i className="fa-solid fa-spinner fa-spin" />
              Loading workflows...
            </div>
          ) : !workflows || workflows.length === 0 ? (
            <p className="py-2 text-sm" style={{ color: "var(--ghw-text-muted)" }}>
              No workflows found in this repo.
            </p>
          ) : (
            <>
              <div className="mb-3 flex gap-3 text-xs">
                <button
                  onClick={onSelectAllWorkflows}
                  className="hover:underline"
                  style={{ color: "var(--ghw-blue)" }}
                >
                  Select all
                </button>
                <button
                  onClick={onDeselectAllWorkflows}
                  className="hover:underline"
                  style={{ color: "var(--ghw-blue)" }}
                >
                  Deselect all
                </button>
              </div>
              <div className="space-y-2">
                {workflows.map((wf) => (
                  <label
                    key={wf.id}
                    className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-1.5"
                  >
                    <input
                      type="checkbox"
                      checked={selectedWorkflows.has(wf.id)}
                      onChange={() => onToggleWorkflow(wf.id)}
                      className="h-4 w-4 rounded"
                      style={{ accentColor: "var(--ghw-blue)" }}
                    />
                    <span className="text-sm" style={{ color: "var(--ghw-text)" }}>{wf.name}</span>
                    <span className="font-mono text-xs" style={{ color: "var(--ghw-text-muted)" }}>
                      {wf.path}
                    </span>
                  </label>
                ))}
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
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [filterWorkflows, setFilterWorkflows] = useState(() => {
    const saved = document.cookie.match(/(?:^|; )ghw_filter_wf=([^;]*)/);
    return saved ? saved[1] === "1" : true;
  });

  function toggleFilterWorkflows() {
    setFilterWorkflows((prev) => {
      const next = !prev;
      document.cookie = `ghw_filter_wf=${next ? "1" : "0"};path=/;max-age=${365 * 24 * 60 * 60}`;
      return next;
    });
  }
  const [repoHasWorkflows, setRepoHasWorkflows] = useState<Map<number, boolean>>(new Map());
  const [filterLoading, setFilterLoading] = useState(false);
  const [search, setSearch] = useState("");

  // Lifted state: which repos are checked, their workflows, and selections
  const [checkedRepos, setCheckedRepos] = useState<Set<string>>(new Set());
  const [repoWorkflows, setRepoWorkflows] = useState<Map<string, Workflow[]>>(new Map());
  const [repoLoadingWorkflows, setRepoLoadingWorkflows] = useState<Set<string>>(new Set());
  const [repoSelections, setRepoSelections] = useState<Map<string, Set<number>>>(new Map());

  const repoKey = (r: { owner: string; name?: string; repo?: string }) =>
    `${r.owner}/${r.name ?? r.repo}`;

  const fetchAll = useCallback(() => {
    setRefreshing(true);
    Promise.all([
      apiFetch<{ repos: Repo[] }>("/repos/available"),
      apiFetch<{ repos: WatchedRepo[] }>("/repos/watched"),
    ])
      .then(([available, watched]) => {
        const sorted = available.repos.sort((a, b) =>
          a.fullName.localeCompare(b.fullName),
        );
        setRepos(sorted);
        setWatchedRepos(watched.repos);

        // Initialize checked state and selections from watched repos
        const checked = new Set<string>();
        const selections = new Map<string, Set<number>>();
        for (const w of watched.repos) {
          const key = `${w.owner}/${w.repo}`;
          checked.add(key);
          selections.set(
            key,
            new Set(w.watchedWorkflows.map((ww) => ww.workflowId)),
          );
        }
        setCheckedRepos(checked);
        setRepoSelections(selections);
      })
      .catch(() => {})
      .finally(() => {
        setLoading(false);
        setRefreshing(false);
      });
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Filter: check all repos for workflows
  useEffect(() => {
    if (!filterWorkflows || repos.length === 0) return;
    const unchecked = repos.filter((r) => !repoHasWorkflows.has(r.id));
    if (unchecked.length === 0) return;

    setFilterLoading(true);
    Promise.all(
      unchecked.map((repo) =>
        apiFetch<{ workflows: Workflow[] }>(
          `/repos/${repo.owner}/${repo.name}/workflows`,
        )
          .then((data) => {
            // Cache workflows while we're at it
            if (data.workflows.length > 0) {
              setRepoWorkflows((prev) => {
                const next = new Map(prev);
                next.set(repoKey(repo), data.workflows);
                return next;
              });
            }
            return { id: repo.id, has: data.workflows.length > 0 };
          })
          .catch(() => ({ id: repo.id, has: false })),
      ),
    ).then((results) => {
      setRepoHasWorkflows((prev) => {
        const next = new Map(prev);
        for (const r of results) next.set(r.id, r.has);
        return next;
      });
      setFilterLoading(false);
    });
  }, [filterWorkflows, repos, repoHasWorkflows]);

  function toggleRepo(repo: Repo) {
    const key = repoKey(repo);
    setCheckedRepos((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
        // Default: select all workflows if we have them cached
        const cached = repoWorkflows.get(key);
        if (cached && !repoSelections.has(key)) {
          setRepoSelections((prev) => {
            const n = new Map(prev);
            n.set(key, new Set(cached.map((w) => w.id)));
            return n;
          });
        }
      }
      return next;
    });
  }

  function selectAllVisible() {
    const keys = new Set(checkedRepos);
    for (const r of filteredRepos) {
      keys.add(repoKey(r));
    }
    setCheckedRepos(keys);
  }

  function deselectAllVisible() {
    const keys = new Set(checkedRepos);
    for (const r of filteredRepos) {
      keys.delete(repoKey(r));
    }
    setCheckedRepos(keys);
  }

  function loadWorkflows(repo: Repo) {
    const key = repoKey(repo);
    if (repoWorkflows.has(key) || repoLoadingWorkflows.has(key)) return;

    setRepoLoadingWorkflows((prev) => new Set(prev).add(key));
    apiFetch<{ workflows: Workflow[] }>(
      `/repos/${repo.owner}/${repo.name}/workflows`,
    )
      .then((data) => {
        setRepoWorkflows((prev) => {
          const next = new Map(prev);
          next.set(key, data.workflows);
          return next;
        });
        // If checked and no selection yet, default to all
        if (checkedRepos.has(key) && !repoSelections.has(key)) {
          setRepoSelections((prev) => {
            const n = new Map(prev);
            n.set(key, new Set(data.workflows.map((w) => w.id)));
            return n;
          });
        }
      })
      .catch(() => {})
      .finally(() => {
        setRepoLoadingWorkflows((prev) => {
          const next = new Set(prev);
          next.delete(key);
          return next;
        });
      });
  }

  function toggleWorkflow(repo: Repo, workflowId: number) {
    const key = repoKey(repo);
    setRepoSelections((prev) => {
      const next = new Map(prev);
      const sel = new Set(prev.get(key) ?? []);
      if (sel.has(workflowId)) sel.delete(workflowId);
      else sel.add(workflowId);
      next.set(key, sel);
      return next;
    });
  }

  function selectAllWorkflows(repo: Repo) {
    const key = repoKey(repo);
    const wfs = repoWorkflows.get(key);
    if (!wfs) return;
    setRepoSelections((prev) => {
      const next = new Map(prev);
      next.set(key, new Set(wfs.map((w) => w.id)));
      return next;
    });
  }

  function deselectAllWorkflows(repo: Repo) {
    const key = repoKey(repo);
    setRepoSelections((prev) => {
      const next = new Map(prev);
      next.set(key, new Set());
      return next;
    });
  }

  async function saveAll() {
    setSaving(true);
    try {
      const wasWatched = new Set(watchedRepos.map((w) => `${w.owner}/${w.repo}`));
      const promises: Promise<unknown>[] = [];

      // Fetch missing workflows for checked repos
      const needWorkflows = Array.from(checkedRepos).filter(
        (key) => !repoWorkflows.has(key),
      );
      if (needWorkflows.length > 0) {
        const fetched = await Promise.all(
          needWorkflows.map((key) => {
            const [owner, name] = key.split("/");
            return apiFetch<{ workflows: Workflow[] }>(
              `/repos/${owner}/${name}/workflows`,
            )
              .then((data) => ({ key, workflows: data.workflows }))
              .catch(() => ({ key, workflows: [] as Workflow[] }));
          }),
        );
        for (const { key, workflows } of fetched) {
          setRepoWorkflows((prev) => {
            const next = new Map(prev);
            next.set(key, workflows);
            return next;
          });
          if (!repoSelections.has(key)) {
            setRepoSelections((prev) => {
              const n = new Map(prev);
              n.set(key, new Set(workflows.map((w) => w.id)));
              return n;
            });
          }
        }
      }

      // Save checked repos
      for (const key of checkedRepos) {
        const [owner, name] = key.split("/");
        const wfs = repoWorkflows.get(key) ?? [];
        const sel = repoSelections.get(key) ?? new Set(wfs.map((w) => w.id));
        const selected = wfs
          .filter((w) => sel.has(w.id))
          .map((w) => ({ id: w.id, name: w.name, path: w.path }));

        if (selected.length > 0) {
          promises.push(
            apiFetch("/repos/watch", {
              method: "POST",
              body: JSON.stringify({ owner, repo: name, workflows: selected }),
            }),
          );
        }
      }

      // Remove unchecked repos that were previously watched
      for (const key of wasWatched) {
        if (!checkedRepos.has(key)) {
          const [owner, name] = key.split("/");
          promises.push(
            apiFetch(`/repos/watch/${owner}/${name}`, { method: "DELETE" }),
          );
        }
      }

      await Promise.all(promises);
      fetchAll();
    } catch {
      // errors handled by apiFetch
    } finally {
      setSaving(false);
    }
  }

  const filteredRepos = repos.filter((r) => {
    if (filterWorkflows && repoHasWorkflows.get(r.id) !== true) return false;
    if (search && !r.fullName.toLowerCase().includes(search.toLowerCase()))
      return false;
    return true;
  });

  const hasChanges = (() => {
    const wasWatched = new Set(watchedRepos.map((w) => `${w.owner}/${w.repo}`));
    for (const key of checkedRepos) {
      if (!wasWatched.has(key)) return true;
    }
    for (const key of wasWatched) {
      if (!checkedRepos.has(key)) return true;
    }
    // Check if workflow selections changed
    for (const w of watchedRepos) {
      const key = `${w.owner}/${w.repo}`;
      const sel = repoSelections.get(key);
      if (!sel) continue;
      const orig = new Set(w.watchedWorkflows.map((ww) => ww.workflowId));
      if (sel.size !== orig.size) return true;
      for (const id of sel) {
        if (!orig.has(id)) return true;
      }
    }
    return false;
  })();

  return (
    <div className="mx-auto max-w-3xl">
      {/* Header row */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold" style={{ color: "var(--ghw-text)" }}>
          Setup Watched Repos
        </h1>
        <div className="flex items-center gap-4">
          <label className="flex cursor-pointer items-center gap-2">
            <span className="text-xs" style={{ color: "var(--ghw-text-muted)" }}>Has workflows</span>
            <button
              role="switch"
              aria-checked={filterWorkflows}
              onClick={toggleFilterWorkflows}
              className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200"
              style={{ backgroundColor: filterWorkflows ? "var(--ghw-btn-green)" : "var(--ghw-border)" }}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${filterWorkflows ? "translate-x-5" : "translate-x-0"}`}
              />
            </button>
          </label>
          <button
            onClick={fetchAll}
            disabled={refreshing}
            className="flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs transition-colors disabled:opacity-50"
            style={{
              borderColor: "var(--ghw-border)",
              backgroundColor: "var(--ghw-bg-btn)",
              color: "var(--ghw-text)",
            }}
          >
            <i
              className={`fa-solid fa-arrows-rotate text-[10px] ${refreshing ? "fa-spin" : ""}`}
            />
            Refresh
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-2">
        <div className="relative">
          <i
            className="fa-solid fa-magnifying-glass pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs"
            style={{ color: "var(--ghw-text-muted)" }}
          />
          <input
            type="text"
            placeholder="Filter repos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-md border py-2 pl-9 pr-3 text-sm outline-none"
            style={{
              borderColor: "var(--ghw-border)",
              backgroundColor: "var(--ghw-bg)",
              color: "var(--ghw-text)",
            }}
          />
        </div>
      </div>

      {/* Select all + Save all row */}
      {!loading && filteredRepos.length > 0 && (
        <div className="mb-4 flex items-center justify-between">
          <div className="flex gap-3 text-xs">
            <button
              onClick={selectAllVisible}
              className="hover:underline"
              style={{ color: "var(--ghw-blue)" }}
            >
              Select all
            </button>
            <button
              onClick={deselectAllVisible}
              className="hover:underline"
              style={{ color: "var(--ghw-blue)" }}
            >
              Deselect all
            </button>
          </div>
          <button
            onClick={saveAll}
            disabled={saving || !hasChanges}
            className="flex items-center gap-2 rounded-md px-4 py-1.5 text-sm font-medium text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50"
            style={{ backgroundColor: "var(--ghw-btn-green)" }}
          >
            {saving && <i className="fa-solid fa-spinner fa-spin" />}
            Save all
          </button>
        </div>
      )}

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-12 animate-pulse rounded-md border"
              style={{ borderColor: "var(--ghw-border)", backgroundColor: "var(--ghw-bg-card)" }}
            />
          ))}
        </div>
      ) : filterLoading ? (
        <div className="flex items-center gap-2 py-8 text-sm" style={{ color: "var(--ghw-text-muted)" }}>
          <i className="fa-solid fa-spinner fa-spin" />
          Checking repos for workflows...
        </div>
      ) : filteredRepos.length === 0 ? (
        <div
          className="rounded-md border px-6 py-12 text-center"
          style={{ borderColor: "var(--ghw-border)", backgroundColor: "var(--ghw-bg-card)" }}
        >
          <i className="fa-solid fa-folder-open mb-3 text-3xl" style={{ color: "var(--ghw-border)" }} />
          <p style={{ color: "var(--ghw-text)" }}>
            {filterWorkflows
              ? "No repos with workflows found"
              : "No repositories found"}
          </p>
          <p className="mt-1 text-sm" style={{ color: "var(--ghw-text-muted)" }}>
            {filterWorkflows
              ? "Try turning off the workflows filter."
              : "Make sure your GitHub account has access to repositories with Actions workflows."}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredRepos.map((repo) => (
            <RepoCard
              key={repo.id}
              repo={repo}
              checked={checkedRepos.has(repoKey(repo))}
              onToggleRepo={() => toggleRepo(repo)}
              workflows={repoWorkflows.get(repoKey(repo)) ?? null}
              selectedWorkflows={
                repoSelections.get(repoKey(repo)) ?? new Set()
              }
              onToggleWorkflow={(id) => toggleWorkflow(repo, id)}
              onSelectAllWorkflows={() => selectAllWorkflows(repo)}
              onDeselectAllWorkflows={() => deselectAllWorkflows(repo)}
              loadingWorkflows={repoLoadingWorkflows.has(repoKey(repo))}
              onExpand={() => loadWorkflows(repo)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
