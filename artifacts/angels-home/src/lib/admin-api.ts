const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "/api";

async function apiFetch(path: string, options: RequestInit = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      ...(options.body && !(options.body instanceof FormData) ? { "Content-Type": "application/json" } : {}),
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

export const adminApi = {
  login: (username: string, password: string) =>
    apiFetch("/admin/login", { method: "POST", body: JSON.stringify({ username, password }) }),
  logout: () => apiFetch("/admin/logout", { method: "POST" }),
  me: () => apiFetch("/admin/me"),

  getSettings: (): Promise<Record<string, any>> => apiFetch("/settings"),
  updateSettings: (values: Record<string, unknown>) =>
    apiFetch("/admin/settings", { method: "PUT", body: JSON.stringify(values) }),

  getFacilityPhotos: () => apiFetch("/facility-photos"),
  createFacilityPhoto: (data: { title: string; description: string; imageUrl: string; sortOrder: number }) =>
    apiFetch("/admin/facility-photos", { method: "POST", body: JSON.stringify(data) }),
  updateFacilityPhoto: (id: number, data: Partial<{ title: string; description: string; imageUrl: string; sortOrder: number }>) =>
    apiFetch(`/admin/facility-photos/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteFacilityPhoto: (id: number) => apiFetch(`/admin/facility-photos/${id}`, { method: "DELETE" }),

  getPartners: () => apiFetch("/partners"),
  createPartner: (data: { name: string; imageUrl: string | null; url: string | null; sortOrder: number }) =>
    apiFetch("/admin/partners", { method: "POST", body: JSON.stringify(data) }),
  updatePartner: (id: number, data: Partial<{ name: string; imageUrl: string | null; url: string | null; sortOrder: number }>) =>
    apiFetch(`/admin/partners/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deletePartner: (id: number) => apiFetch(`/admin/partners/${id}`, { method: "DELETE" }),

  upload: async (file: File): Promise<{ url: string }> => {
    const form = new FormData();
    form.append("file", file);
    return apiFetch("/admin/upload", { method: "POST", body: form });
  },

  getNotices: (params?: { page?: number; limit?: number; q?: string; scope?: "title" | "all" }) => {
    const search = new URLSearchParams();
    if (params?.page) search.set("page", String(params.page));
    if (params?.limit) search.set("limit", String(params.limit));
    if (params?.q) search.set("q", params.q);
    if (params?.scope) search.set("scope", params.scope);
    const qs = search.toString();
    return apiFetch(`/notices${qs ? `?${qs}` : ""}`);
  },
  getNotice: (id: number) => apiFetch(`/notices/${id}`),
  createNotice: (data: {
    title: string;
    content: string;
    author: string;
    pinned: boolean;
    hidden?: boolean;
    attachments: { name: string; url: string }[];
  }) => apiFetch("/admin/notices", { method: "POST", body: JSON.stringify(data) }),
  updateNotice: (
    id: number,
    data: Partial<{
      title: string;
      content: string;
      author: string;
      pinned: boolean;
      hidden: boolean;
      attachments: { name: string; url: string }[];
    }>,
  ) => apiFetch(`/admin/notices/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteNotice: (id: number) => apiFetch(`/admin/notices/${id}`, { method: "DELETE" }),

  getNoticeComments: (id: number) => apiFetch(`/notices/${id}/comments`),
  createNoticeComment: (id: number, data: { authorName: string; content: string }) =>
    apiFetch(`/notices/${id}/comments`, { method: "POST", body: JSON.stringify(data) }),
  deleteNoticeComment: (id: number) => apiFetch(`/admin/notice-comments/${id}`, { method: "DELETE" }),

  uploadAttachment: async (file: File): Promise<{ url: string; name: string }> => {
    const form = new FormData();
    form.append("file", file);
    return apiFetch("/admin/upload-attachment", { method: "POST", body: form });
  },

  getFaqs: () => apiFetch("/faqs"),
  createFaq: (data: { question: string; answer: string; sortOrder: number }) =>
    apiFetch("/admin/faqs", { method: "POST", body: JSON.stringify(data) }),
  updateFaq: (id: number, data: Partial<{ question: string; answer: string; sortOrder: number }>) =>
    apiFetch(`/admin/faqs/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteFaq: (id: number) => apiFetch(`/admin/faqs/${id}`, { method: "DELETE" }),

  submitInquiry: (data: {
    type: "counsel" | "donation" | "volunteer";
    name: string;
    phone: string;
    email?: string;
    message: string;
    password?: string;
    details?: Record<string, unknown>;
  }) => apiFetch("/inquiries", { method: "POST", body: JSON.stringify(data) }),
  lookupInquiries: (data: { type: "counsel" | "donation" | "volunteer"; phone: string; password: string }) =>
    apiFetch("/inquiries/lookup", { method: "POST", body: JSON.stringify(data) }),
  getInquiries: (type?: string) => apiFetch(`/admin/inquiries${type ? `?type=${type}` : ""}`),
  updateInquiryStatus: (id: number, status: "new" | "read" | "done") =>
    apiFetch(`/admin/inquiries/${id}`, { method: "PATCH", body: JSON.stringify({ status }) }),
  updateInquiryReply: (id: number, adminReply: string) =>
    apiFetch(`/admin/inquiries/${id}`, { method: "PATCH", body: JSON.stringify({ adminReply }) }),
  deleteInquiry: (id: number) => apiFetch(`/admin/inquiries/${id}`, { method: "DELETE" }),

  getAdmins: () => apiFetch("/admin/admins"),
  createAdmin: (data: { username: string; password: string }) =>
    apiFetch("/admin/admins", { method: "POST", body: JSON.stringify(data) }),
  deleteAdmin: (id: number) => apiFetch(`/admin/admins/${id}`, { method: "DELETE" }),

  getGallery: (params?: { page?: number; limit?: number; q?: string }) => {
    const search = new URLSearchParams();
    if (params?.page) search.set("page", String(params.page));
    if (params?.limit) search.set("limit", String(params.limit));
    if (params?.q) search.set("q", params.q);
    const qs = search.toString();
    return apiFetch(`/gallery${qs ? `?${qs}` : ""}`);
  },
  getGalleryItem: (id: number) => apiFetch(`/gallery/${id}`),
  createGalleryItem: (data: { title: string; content?: string; imageUrl: string; images?: string[] }) =>
    apiFetch("/admin/gallery", { method: "POST", body: JSON.stringify(data) }),
  updateGalleryItem: (
    id: number,
    data: Partial<{ title: string; content: string; imageUrl: string; images: string[]; sortOrder: number }>,
  ) => apiFetch(`/admin/gallery/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteGalleryItem: (id: number) => apiFetch(`/admin/gallery/${id}`, { method: "DELETE" }),

  getDonationNews: (params?: { page?: number; limit?: number; q?: string; scope?: "title" | "all" }) => {
    const search = new URLSearchParams();
    if (params?.page) search.set("page", String(params.page));
    if (params?.limit) search.set("limit", String(params.limit));
    if (params?.q) search.set("q", params.q);
    if (params?.scope) search.set("scope", params.scope);
    const qs = search.toString();
    return apiFetch(`/donation-news${qs ? `?${qs}` : ""}`);
  },
  getDonationNewsItem: (id: number) => apiFetch(`/donation-news/${id}`),
  createDonationNews: (data: {
    title: string;
    content: string;
    imageUrl: string | null;
    imageAlign?: "left" | "right" | "center";
    attachments?: { name: string; url: string }[];
  }) => apiFetch("/admin/donation-news", { method: "POST", body: JSON.stringify(data) }),
  updateDonationNews: (
    id: number,
    data: Partial<{
      title: string;
      content: string;
      imageUrl: string | null;
      imageAlign: "left" | "right" | "center";
      attachments: { name: string; url: string }[];
    }>,
  ) => apiFetch(`/admin/donation-news/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteDonationNews: (id: number) => apiFetch(`/admin/donation-news/${id}`, { method: "DELETE" }),

  getCalendarEvents: () => apiFetch("/calendar-events"),
  createCalendarEvent: (data: { eventDate: string; title: string; detail?: string | null; imageUrl?: string | null }) =>
    apiFetch("/admin/calendar-events", { method: "POST", body: JSON.stringify(data) }),
  updateCalendarEvent: (id: number, data: Partial<{ eventDate: string; title: string; detail: string | null; imageUrl: string | null }>) =>
    apiFetch(`/admin/calendar-events/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteCalendarEvent: (id: number) => apiFetch(`/admin/calendar-events/${id}`, { method: "DELETE" }),

  getPushAdmins: (): Promise<string[]> => apiFetch("/admin/push-tokens/admins"),
  sendPush: (data: { title: string; body: string; target: string }) =>
    apiFetch("/admin/push/send", { method: "POST", body: JSON.stringify(data) }),

  getChildcareShares: (params?: { page?: number; limit?: number; q?: string; scope?: "title" | "all" }) => {
    const search = new URLSearchParams();
    if (params?.page) search.set("page", String(params.page));
    if (params?.limit) search.set("limit", String(params.limit));
    if (params?.q) search.set("q", params.q);
    if (params?.scope) search.set("scope", params.scope);
    const qs = search.toString();
    return apiFetch(`/childcare-shares${qs ? `?${qs}` : ""}`);
  },
  getChildcareShareItem: (id: number) => apiFetch(`/childcare-shares/${id}`),
  createChildcareShare: (data: {
    title: string;
    content: string;
    imageUrl: string | null;
    attachments?: { name: string; url: string }[];
  }) => apiFetch("/admin/childcare-shares", { method: "POST", body: JSON.stringify(data) }),
  updateChildcareShare: (
    id: number,
    data: Partial<{ title: string; content: string; imageUrl: string | null; attachments: { name: string; url: string }[] }>,
  ) => apiFetch(`/admin/childcare-shares/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteChildcareShare: (id: number) => apiFetch(`/admin/childcare-shares/${id}`, { method: "DELETE" }),

  getPopupBanners: () => apiFetch("/popup-banners"),
  getAdminPopupBanners: () => apiFetch("/admin/popup-banners"),
  createPopupBanner: (data: {
    imageUrl: string;
    linkUrl: string | null;
    published: boolean;
    startDate: string | null;
    endDate: string | null;
    sortOrder: number;
  }) => apiFetch("/admin/popup-banners", { method: "POST", body: JSON.stringify(data) }),
  updatePopupBanner: (
    id: number,
    data: Partial<{
      imageUrl: string;
      linkUrl: string | null;
      published: boolean;
      startDate: string | null;
      endDate: string | null;
      sortOrder: number;
    }>,
  ) => apiFetch(`/admin/popup-banners/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deletePopupBanner: (id: number) => apiFetch(`/admin/popup-banners/${id}`, { method: "DELETE" }),
};
