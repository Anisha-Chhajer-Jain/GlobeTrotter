export class ApiError extends Error {
  public status: number;
  public fieldErrors: { field: string; message: string }[];

  constructor(message: string, status: number, fieldErrors: { field: string; message: string }[] = []) {
    super(message);
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`/api${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const body = await res.json().catch(() => null);

  if (!res.ok || !body?.success) {
    throw new ApiError(body?.error || "Something went wrong", res.status, body?.fieldErrors || []);
  }

  return body.data as T;
}

const get = <T>(path: string) => apiFetch<T>(path);
const post = <T>(path: string, data?: unknown) =>
  apiFetch<T>(path, { method: "POST", body: data !== undefined ? JSON.stringify(data) : undefined });
const put = <T>(path: string, data?: unknown) =>
  apiFetch<T>(path, { method: "PUT", body: data !== undefined ? JSON.stringify(data) : undefined });
const patch = <T>(path: string, data?: unknown) =>
  apiFetch<T>(path, { method: "PATCH", body: data !== undefined ? JSON.stringify(data) : undefined });
const del = <T>(path: string, data?: unknown) =>
  apiFetch<T>(path, { method: "DELETE", body: data !== undefined ? JSON.stringify(data) : undefined });

function qs(params: Record<string, string | number | boolean | undefined | null>): string {
  const usp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") usp.set(k, String(v));
  }
  const s = usp.toString();
  return s ? `?${s}` : "";
}

export const tripsApi = {
  list: (params: { page?: number; limit?: number; status?: string; search?: string } = {}) =>
    get<{ trips: any[]; pagination: any }>(`/trips${qs(params)}`),
  get: (tripId: string) => get<{ trip: any }>(`/trips/${tripId}`),
  create: (data: any) => post<{ trip: any }>(`/trips`, data),
  update: (tripId: string, data: any) => put<{ trip: any }>(`/trips/${tripId}`, data),
  remove: (tripId: string) => del<{ message: string }>(`/trips/${tripId}`),
  copy: (tripId: string, data: any = {}) => post<{ trip: any }>(`/trips/${tripId}/copy`, data),
};

export const stopsApi = {
  list: (tripId: string) => get<{ stops: any[] }>(`/trips/${tripId}/stops`),
  create: (tripId: string, data: any) => post<{ stop: any }>(`/trips/${tripId}/stops`, data),
  update: (tripId: string, stopId: string, data: any) =>
    put<{ stop: any }>(`/trips/${tripId}/stops/${stopId}`, data),
  remove: (tripId: string, stopId: string) =>
    del<{ message: string }>(`/trips/${tripId}/stops/${stopId}`),
  reorder: (tripId: string, stopIds: string[]) =>
    put<{ stops: any[] }>(`/trips/${tripId}/stops/reorder`, { stopIds }),
};

export const tripActivitiesApi = {
  list: (tripId: string, stopId: string) =>
    get<{ activities: any[] }>(`/trips/${tripId}/stops/${stopId}/activities`),
  add: (tripId: string, stopId: string, data: any) =>
    post<{ activity: any }>(`/trips/${tripId}/stops/${stopId}/activities`, data),
  reorder: (tripId: string, stopId: string, activityIds: string[]) =>
    post<{ activities: any[] }>(`/trips/${tripId}/stops/${stopId}/activities/reorder`, { activityIds }),
  // Flat resource routes — addressed by the trip-activity's own id, no tripId/stopId needed.
  update: (tripActivityId: string, data: any) => put<{ activity: any }>(`/trip-activities/${tripActivityId}`, data),
  remove: (tripActivityId: string) => del<{ message: string }>(`/trip-activities/${tripActivityId}`),
};

export const citiesApi = {
  search: (params: Record<string, any> = {}) => get<{ cities: any[]; pagination: any }>(`/cities${qs(params)}`),
  get: (cityId: string) => get<{ city: any }>(`/cities/${cityId}`),
};

export const activitiesApi = {
  search: (params: Record<string, any> = {}) =>
    get<{ activities: any[]; types: any[]; pagination: any }>(`/activities${qs(params)}`),
  get: (activityId: string) => get<{ activity: any }>(`/activities/${activityId}`),
};

export const liveCitiesApi = {
  search: (query: string) => get<{ cities: any[] }>(`/cities/live${qs({ query })}`),
  import: (data: any) => post<{ city: any }>(`/cities/live/import`, data),
};

export const liveActivitiesApi = {
  search: (cityId: string, query?: string) => get<{ activities: any[] }>(`/activities/live${qs({ cityId, query })}`),
  import: (data: any) => post<{ activity: any }>(`/activities/live/import`, data),
};

export const expensesApi = {
  list: (tripId: string, params: Record<string, any> = {}) =>
    get<{ expenses: any[]; budget: any; pagination: any }>(`/trips/${tripId}/expenses${qs(params)}`),
  create: (tripId: string, data: any) => post<{ expense: any }>(`/trips/${tripId}/expenses`, data),
  // Flat resource routes — addressed by the expense's own id.
  update: (expenseId: string, data: any) => put<{ expense: any }>(`/expenses/${expenseId}`, data),
  remove: (expenseId: string) => del<{ message: string }>(`/expenses/${expenseId}`),
};

export const budgetApi = {
  get: (tripId: string) => get<{ budget: any }>(`/trips/${tripId}/budget`),
};

export const sharesApi = {
  list: (tripId: string) =>
    get<{ isPublic: boolean; shareToken: string | null; publicUrl: string | null; shares: any[] }>(
      `/trips/${tripId}/share`
    ),
  invite: (tripId: string, data: any) => post<{ share: any; message?: string }>(`/trips/${tripId}/share`, data),
  update: (tripId: string, shareId: string, data: any) =>
    patch<{ share: any }>(`/trips/${tripId}/share/${shareId}`, data),
  remove: (tripId: string, shareId: string) =>
    del<{ message: string }>(`/trips/${tripId}/share/${shareId}`),
  togglePublic: (tripId: string, isPublic?: boolean) =>
    post<{ isPublic: boolean; shareToken: string | null; publicUrl: string | null }>(
      `/trips/${tripId}/share/toggle-public`,
      { isPublic }
    ),
};

export const dashboardApi = {
  get: () => get<any>(`/dashboard`),
};

export const adminApi = {
  getStats: () => get<any>(`/admin/stats`),
  getUser: (userId: string) => get<{ user: any; trips: any[] }>(`/admin/users/${userId}`),
};

export const publicTripApi = {
  get: (slug: string) => get<{ trip: any; isOwner: boolean; canEdit: boolean }>(`/public/trips/${slug}`),
  copy: (slug: string, data: any = {}) => post<{ trip: any }>(`/public/trips/${slug}/copy`, data),
};

export const communityApi = {
  list: (params: Record<string, any> = {}) =>
    get<{ posts: any[]; pagination: any }>(`/community/posts${qs(params)}`),
  get: (postId: string) => get<{ post: any }>(`/community/posts/${postId}`),
  create: (data: any) => post<{ post: any }>(`/community/posts`, data),
  remove: (postId: string) => del<{ message: string }>(`/community/posts/${postId}`),
  toggleLike: (postId: string) => post<{ liked: boolean; likesCount: number }>(`/community/posts/${postId}/like`),
  addComment: (postId: string, content: string) =>
    post<{ comment: any }>(`/community/posts/${postId}/comments`, { content }),
};

export const profileApi = {
  get: () => get<{ user: any }>(`/users/me`),
  update: (data: any) => put<{ user: any }>(`/users/me`, data),
  changePassword: (data: any) => put<{ message: string }>(`/users/me/password`, data),
  deleteAccount: (password: string) => del<{ message: string }>(`/users/me`, { password }),
};

export const authApi = {
  signup: (data: any) => post<{ user: any }>(`/auth/signup`, data),
  login: (data: any) => post<{ user: any }>(`/auth/login`, data),
  logout: () => post<{ message: string }>(`/auth/logout`),
  me: () => get<{ user: any }>(`/auth/me`),
  forgotPassword: (email: string) => post<{ message: string }>(`/auth/forgot-password`, { email }),
  resetPassword: (data: any) => post<{ message: string }>(`/auth/reset-password`, data),
};
