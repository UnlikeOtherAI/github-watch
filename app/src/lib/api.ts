const BASE = "/api";

export async function apiFetch<T>(
  path: string,
  opts?: RequestInit,
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    credentials: "include",
    ...opts,
    headers: { "Content-Type": "application/json", ...opts?.headers },
  });
  if (res.status === 401) {
    throw new Error("Unauthorized");
  }
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}
