const API_BASE = ((import.meta.env.VITE_API_BASE_URL as string) ?? "/api").replace(/\/api$/, "");

export function resolveImageUrl(url: string | null | undefined): string {
  if (!url) return "";
  if (url.startsWith("http") || url.startsWith("data:")) return url;
  return `${API_BASE}${url}`;
}
