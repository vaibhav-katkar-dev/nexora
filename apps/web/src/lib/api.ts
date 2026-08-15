import { SiteConfigJSON } from "@ai-platform/shared";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

// ─── Token refresh state (prevent concurrent refresh storms) ───────────────
let isRefreshing = false;
let refreshQueue: Array<(token: string | null) => void> = [];

async function performTokenRefresh(): Promise<string | null> {
  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });
    if (!res.ok) return null;
    const data = await res.json();
    const newToken = data?.data?.accessToken;
    if (newToken) {
      localStorage.setItem("accessToken", newToken);
      return newToken;
    }
    return null;
  } catch {
    return null;
  }
}

// ─── Internal fetch wrapper ────────────────────────────────────────────────
async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  retry = true
): Promise<T> {
  const accessToken =
    typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: "include", // sends httpOnly refresh cookie automatically
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...options.headers,
    },
  });

  // ── 401 Auto-Refresh Flow ─────────────────────────────────────────────
  if (res.status === 401 && retry) {
    if (!isRefreshing) {
      isRefreshing = true;
      const newToken = await performTokenRefresh();
      isRefreshing = false;
      refreshQueue.forEach((cb) => cb(newToken));
      refreshQueue = [];

      if (!newToken) {
        // Refresh failed — redirect to login
        if (typeof window !== "undefined") {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("user");
          window.location.href = "/login";
        }
        throw new Error("Session expired. Please sign in again.");
      }
      // Retry original request with new token
      return apiFetch<T>(path, options, false);
    } else {
      // Queue up while refresh is in progress
      return new Promise<T>((resolve, reject) => {
        refreshQueue.push(async (token) => {
          if (!token) {
            reject(new Error("Session expired."));
          } else {
            try {
              resolve(await apiFetch<T>(path, options, false));
            } catch (e) {
              reject(e);
            }
          }
        });
      });
    }
  }

  // ── Safe JSON Parsing ────────────────────────────────────────────────
  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");

  if (!res.ok) {
    const errorData = isJson ? await res.json() : null;
    throw new Error(
      errorData?.error?.message || `Request failed (${res.status})`
    );
  }

  // 204 No Content or non-JSON
  if (res.status === 204 || !isJson) {
    return {} as T;
  }

  return res.json() as Promise<T>;
}

// ─── Auth ─────────────────────────────────────────────────────────────────
export const authApi = {
  register: (body: { name: string; email: string; password: string }) =>
    apiFetch<{ data: { accessToken: string; user: any } }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  login: (body: { email: string; password: string }) =>
    apiFetch<{ data: { accessToken: string; user: any } }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  logout: () => apiFetch("/auth/logout", { method: "POST" }),

  refresh: () =>
    apiFetch<{ data: { accessToken: string } }>("/auth/refresh", {
      method: "POST",
    }),

  me: () => apiFetch<{ data: { user: any } }>("/auth/me"),
};

// ─── Projects ─────────────────────────────────────────────────────────────
const publicSiteCache = new Map<string, { data: any; timestamp: number }>();
const PUBLIC_CACHE_TTL_MS = 60 * 1000; // 60s memory cache

export const projectsApi = {
  list: (params?: { page?: number; status?: string }) => {
    const qs = new URLSearchParams(params as any).toString();
    return apiFetch<{ data: any[]; meta: any }>(
      `/projects${qs ? `?${qs}` : ""}`
    );
  },

  getAll: (params?: { page?: number; status?: string }) => {
    const qs = new URLSearchParams(params as any).toString();
    return apiFetch<{ data: any[]; meta: any }>(
      `/projects${qs ? `?${qs}` : ""}`
    );
  },

  get: (id: string) => apiFetch<{ data: any }>(`/projects/${id}`),

  getOne: (id: string) => apiFetch<{ data: any }>(`/projects/${id}`),

  getPublic: async (slug: string) => {
    const cached = publicSiteCache.get(slug);
    const now = Date.now();
    if (cached && now - cached.timestamp < PUBLIC_CACHE_TTL_MS) {
      return cached.data;
    }
    const res = await apiFetch<{ data: any }>(`/projects/public/${slug}`);
    if (res?.data) {
      publicSiteCache.set(slug, { data: res, timestamp: now });
    }
    return res;
  },

  invalidatePublicCache: (slug?: string) => {
    if (slug) publicSiteCache.delete(slug);
    else publicSiteCache.clear();
  },

  create: (body: { name: string; category: string; config: SiteConfigJSON }) =>
    apiFetch<{ data: any }>("/projects", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  update: (
    id: string,
    body: Partial<{
      name: string;
      config: SiteConfigJSON;
      customCode: any;
      seo: any;
    }>
  ) =>
    apiFetch<{ data: any }>(`/projects/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  duplicate: (id: string) =>
    apiFetch<{ data: any }>(`/projects/${id}/duplicate`, { method: "POST" }),

  delete: (id: string) => apiFetch(`/projects/${id}`, { method: "DELETE" }),

  publish: (id: string) =>
    apiFetch<{ data: { staticUrl: string; version: number } }>(
      `/projects/${id}/publish`,
      { method: "POST" }
    ),

  updateSlug: (id: string, slug: string) =>
    apiFetch<{ data: any }>(`/projects/${id}`, {
      method: "PUT",
      body: JSON.stringify({ slug }),
    }),

  deployments: (id: string) =>
    apiFetch<{ data: any[] }>(`/projects/${id}/deployments`),
};

// ─── Custom Domains ────────────────────────────────────────────────────────
export const domainsApi = {
  list: (siteId?: string) =>
    apiFetch<{ data: any[] }>(`/domains${siteId ? `?siteId=${siteId}` : ""}`),

  add: (body: { domain: string; siteId: string }) =>
    apiFetch<{ data: any }>("/domains", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  get: (id: string) => apiFetch<{ data: any }>(`/domains/${id}`),

  verify: (id: string) =>
    apiFetch<{ data: any; message: string }>(`/domains/${id}/verify`, {
      method: "POST",
    }),

  setPrimary: (id: string) =>
    apiFetch<{ data: any; message: string }>(`/domains/${id}/primary`, {
      method: "POST",
    }),

  delete: (id: string) => apiFetch(`/domains/${id}`, { method: "DELETE" }),
};

// ─── AI Generation ─────────────────────────────────────────────────────────
export const aiApi = {
  generate: (body: { prompt: string; categoryHint?: string; model?: string }) =>
    apiFetch<{
      data: {
        config: SiteConfigJSON;
        category: string;
        cached: boolean;
        tokensUsed?: { promptTokens: number; completionTokens: number; totalTokens: number };
        modelUsed?: string;
      };
    }>("/ai/generate", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  generateSite: (body: { prompt: string; category?: string; model?: string }) =>
    apiFetch<{
      data: {
        config: SiteConfigJSON;
        category: string;
        cached: boolean;
        tokensUsed?: { promptTokens: number; completionTokens: number; totalTokens: number };
        modelUsed?: string;
      };
    }>("/ai/generate", {
      method: "POST",
      body: JSON.stringify({ prompt: body.prompt, categoryHint: body.category, model: body.model }),
    }),
};

// ─── Templates API ─────────────────────────────────────────────────────────
export const templatesApi = {
  list: (category?: string) =>
    apiFetch<{ data: any[] }>(
      `/templates${category ? `?category=${category}` : ""}`
    ),

  get: (id: string) => apiFetch<{ data: any }>(`/templates/${id}`),

  addBulk: (templates: any[]) =>
    apiFetch<{ data: any[] }>("/templates/bulk", {
      method: "POST",
      body: JSON.stringify({ templates }),
    }),

  seed: () =>
    apiFetch<{ data: any[] }>("/templates/seed", {
      method: "POST",
    }),

  // ── Admin Template Management System (Phase 1) ─────────────────────────
  // Builds a clean query string, omitting any undefined/null/empty values so
  // we never send literal "undefined" strings that fail backend validation.
  adminList: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    category?: string;
    sortBy?: string;
    sortOrder?: string;
    featured?: string;
    premium?: string;
  }) => {
    const clean: Record<string, string> = {};
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          clean[key] = String(value);
        }
      });
    }
    const qs = new URLSearchParams(clean).toString();
    return apiFetch<{ data: any[]; meta: any }>(
      `/templates/admin/list${qs ? `?${qs}` : ""}`
    );
  },

  adminTrash: () =>
    apiFetch<{ data: any[]; meta: any }>("/templates/admin/trash"),

  emptyTrash: () =>
    apiFetch<{ data: { deleted: number } }>("/templates/admin/trash", {
      method: "DELETE",
    }),

  create: (body: any) =>
    apiFetch<{ data: any }>("/templates", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  update: (id: string, body: any) =>
    apiFetch<{ data: any }>(`/templates/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  updateStatus: (id: string, status: string) =>
    apiFetch<{ data: any }>(`/templates/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  remove: (id: string) =>
    apiFetch<{ data: any }>(`/templates/${id}`, { method: "DELETE" }),

  restore: (id: string) =>
    apiFetch<{ data: any }>(`/templates/${id}/restore`, { method: "POST" }),

permanentDelete: (id: string) =>
    apiFetch<{ data: any }>(`/templates/${id}/permanent`, { method: "DELETE" }),

  bulkDelete: (ids: string[]) =>
    apiFetch<{ data: { deleted: number; matched: number } }>("/templates/admin/bulk-delete", {
      method: "POST",
      body: JSON.stringify({ ids }),
    }),

  bulkImport: (templates: any[]) =>
    apiFetch<{
      data: { imported: any[]; failed: any[]; duplicates: any[] };
      meta: { importedCount: number; failedCount: number; duplicateCount: number };
    }>("/templates/bulk-import", {
      method: "POST",
      body: JSON.stringify({ templates }),
    }),

preview: (id: string) =>
    apiFetch<{ data: any }>(`/templates/${id}/preview`),

  exportAll: () =>
    apiFetch<{ data: any[]; meta: any }>(`/templates/admin/export`),
};

// ─── Media / Cloudinary Upload ──────────────────────────────────────────────
export const mediaApi = {
  upload: async (file: File, projectId?: string): Promise<{ url: string; id: string; fileName: string }> => {
    const accessToken = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
    const formData = new FormData();
    formData.append("file", file);
    if (projectId) formData.append("projectId", projectId);

    const res = await fetch(`${API_BASE}/media/upload`, {
      method: "POST",
      credentials: "include",
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || `Upload failed (${res.status})`);
    }
    const data = await res.json();
    return data.data;
  },

  list: () => apiFetch<{ data: any[] }>("/media"),

  delete: (id: string) => apiFetch(`/media/${id}`, { method: "DELETE" }),
};

