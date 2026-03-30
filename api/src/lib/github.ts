const GITHUB_API = "https://api.github.com";

export async function githubFetch(path: string, token: string) {
  const res = await fetch(`${GITHUB_API}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
    },
  });
  if (!res.ok) throw new Error(`GitHub API ${res.status}: ${path}`);
  return res.json();
}

export interface GHRepo {
  id: number;
  full_name: string;
  name: string;
  owner: { login: string };
  private: boolean;
}

export interface GHWorkflow {
  id: number;
  name: string;
  path: string;
  state: string;
}

export interface GHWorkflowRun {
  id: number;
  name: string;
  head_branch: string;
  status: string;
  conclusion: string | null;
  html_url: string;
  created_at: string;
  updated_at: string;
  run_number: number;
  workflow_id: number;
  head_commit: { message: string; author: { name: string } } | null;
}
