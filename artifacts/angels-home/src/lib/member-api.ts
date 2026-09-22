const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "/api";

async function apiFetch(path: string, options: RequestInit = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: `요청 실패 (${res.status})` }));
    throw new Error(body.error ?? `요청 실패 (${res.status})`);
  }

  if (res.status === 204) return null;
  return res.json();
}

export const memberApi = {
  register: (data: { email: string; password: string; name: string; phone?: string }) =>
    apiFetch("/members/register", { method: "POST", body: JSON.stringify(data) }),
  login: (email: string, password: string) =>
    apiFetch("/members/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  logout: () => apiFetch("/members/logout", { method: "POST" }),
  me: (): Promise<{ email: string; name: string }> => apiFetch("/members/me"),
};
