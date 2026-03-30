import { useState, useEffect } from "react";
import { apiFetch } from "../lib/api";

interface User {
  id: string;
  login: string;
  name: string | null;
  avatarUrl: string | null;
}

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<{ user: User }>("/auth/me")
      .then((data) => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  return { user, loading };
}
