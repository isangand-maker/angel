import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { adminApi } from "./admin-api";

export function useSiteSettings() {
  return useQuery({
    queryKey: ["site-settings"],
    queryFn: () => adminApi.getSettings(),
    staleTime: 60_000,
  });
}

export function useFacilityPhotos() {
  return useQuery({
    queryKey: ["facility-photos"],
    queryFn: () => adminApi.getFacilityPhotos(),
    staleTime: 60_000,
  });
}

export function usePartners() {
  return useQuery({
    queryKey: ["partners"],
    queryFn: () => adminApi.getPartners(),
    staleTime: 60_000,
  });
}

export function useNotices() {
  return useQuery({
    queryKey: ["notices", "widget"],
    queryFn: () => adminApi.getNotices({ limit: 6 }),
    select: (res) => res.items,
    staleTime: 60_000,
  });
}

export function useNoticesSearch(params: { page: number; limit: number; q?: string; scope?: "title" | "all" }) {
  return useQuery({
    queryKey: ["notices", "search", params],
    queryFn: () => adminApi.getNotices(params),
    staleTime: 30_000,
    placeholderData: (prev) => prev,
  });
}

export function useNoticesInfinite(params: { limit: number; q?: string; scope?: "title" | "all" }) {
  return useInfiniteQuery({
    queryKey: ["notices", "infinite", params],
    queryFn: ({ pageParam }) => adminApi.getNotices({ ...params, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const loaded = lastPage.page * lastPage.limit;
      return loaded < lastPage.total ? lastPage.page + 1 : undefined;
    },
    staleTime: 30_000,
  });
}

export function useNotice(id: number) {
  return useQuery({
    queryKey: ["notice", id],
    queryFn: () => adminApi.getNotice(id),
    enabled: Number.isFinite(id),
  });
}

export function useNoticeComments(id: number) {
  return useQuery({
    queryKey: ["notice-comments", id],
    queryFn: () => adminApi.getNoticeComments(id),
    enabled: Number.isFinite(id),
  });
}

export function useFaqs() {
  return useQuery({
    queryKey: ["faqs"],
    queryFn: () => adminApi.getFaqs(),
    staleTime: 60_000,
  });
}

export function useGallery() {
  return useQuery({
    queryKey: ["gallery", "widget"],
    queryFn: () => adminApi.getGallery({ limit: 6 }),
    select: (res) => res.items,
    staleTime: 60_000,
  });
}

export function useGallerySearch(params: { page: number; limit: number; q?: string }) {
  return useQuery({
    queryKey: ["gallery", "search", params],
    queryFn: () => adminApi.getGallery(params),
    staleTime: 30_000,
    placeholderData: (prev) => prev,
  });
}

export function useGalleryInfinite(params: { limit: number; q?: string }) {
  return useInfiniteQuery({
    queryKey: ["gallery", "infinite", params],
    queryFn: ({ pageParam }) => adminApi.getGallery({ ...params, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const loaded = lastPage.page * lastPage.limit;
      return loaded < lastPage.total ? lastPage.page + 1 : undefined;
    },
    staleTime: 30_000,
  });
}

export function useDonationNewsSearch(params: { page: number; limit: number; q?: string; scope?: "title" | "all" }) {
  return useQuery({
    queryKey: ["donation-news", "search", params],
    queryFn: () => adminApi.getDonationNews(params),
    staleTime: 30_000,
    placeholderData: (prev) => prev,
  });
}

export function useDonationNewsInfinite(params: { limit: number; q?: string; scope?: "title" | "all" }) {
  return useInfiniteQuery({
    queryKey: ["donation-news", "infinite", params],
    queryFn: ({ pageParam }) => adminApi.getDonationNews({ ...params, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const loaded = lastPage.page * lastPage.limit;
      return loaded < lastPage.total ? lastPage.page + 1 : undefined;
    },
    staleTime: 30_000,
  });
}

export function useGalleryItem(id: number) {
  return useQuery({
    queryKey: ["gallery", "item", id],
    queryFn: () => adminApi.getGalleryItem(id),
    enabled: Number.isFinite(id),
  });
}

export function useDonationNewsItem(id: number) {
  return useQuery({
    queryKey: ["donation-news", "item", id],
    queryFn: () => adminApi.getDonationNewsItem(id),
    enabled: Number.isFinite(id),
  });
}

export function useCalendarEvents() {
  return useQuery({
    queryKey: ["calendar-events"],
    queryFn: () => adminApi.getCalendarEvents(),
    staleTime: 60_000,
  });
}

export function useChildcareShareItem(id: number) {
  return useQuery({
    queryKey: ["childcare-shares", "item", id],
    queryFn: () => adminApi.getChildcareShareItem(id),
    enabled: Number.isFinite(id),
  });
}

export function useChildcareSharesSearch(params: { page: number; limit: number; q?: string; scope?: "title" | "all" }) {
  return useQuery({
    queryKey: ["childcare-shares", "search", params],
    queryFn: () => adminApi.getChildcareShares(params),
    staleTime: 30_000,
    placeholderData: (prev) => prev,
  });
}

export function useChildcareSharesInfinite(params: { limit: number; q?: string; scope?: "title" | "all" }) {
  return useInfiniteQuery({
    queryKey: ["childcare-shares", "infinite", params],
    queryFn: ({ pageParam }) => adminApi.getChildcareShares({ ...params, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const loaded = lastPage.page * lastPage.limit;
      return loaded < lastPage.total ? lastPage.page + 1 : undefined;
    },
    staleTime: 30_000,
  });
}

export function usePopupBanners() {
  return useQuery({
    queryKey: ["popup-banners"],
    queryFn: () => adminApi.getPopupBanners(),
    staleTime: 60_000,
  });
}
