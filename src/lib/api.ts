import type {
  GuestGroup,
  SummaryMetrics,
  PublicRsvpResolveResponse,
  SubmitRsvpPayload,
} from '../types/wedding';

const ADMIN_TOKEN_KEY = 'syl_admin_token';

export function getAdminToken(): string | null {
  return sessionStorage.getItem(ADMIN_TOKEN_KEY);
}

export function setAdminToken(token: string): void {
  sessionStorage.setItem(ADMIN_TOKEN_KEY, token);
}

export function clearAdminToken(): void {
  sessionStorage.removeItem(ADMIN_TOKEN_KEY);
}

export function isAdminAuthenticated(): boolean {
  return Boolean(getAdminToken());
}

async function fetchJson<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = getAdminToken();
  const headers = new Headers(options.headers || {});
  
  if (token) {
    headers.set('x-admin-token', token);
  }
  if (!headers.has('Content-Type') && options.body && typeof options.body === 'string') {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(url, { ...options, headers });
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.error || `Error en la solicitud (${res.status})`);
  }

  return data as T;
}

// Admin APIs
export async function adminLogin(password: string): Promise<{ success: boolean; token: string }> {
  const res = await fetchJson<{ success: boolean; token: string }>('/api/admin/login', {
    method: 'POST',
    body: JSON.stringify({ password }),
  });
  if (res.token) {
    setAdminToken(res.token);
  }
  return res;
}

export async function fetchAdminGroups(): Promise<GuestGroup[]> {
  return fetchJson<GuestGroup[]>('/api/admin/groups');
}

export async function fetchAdminSummary(): Promise<SummaryMetrics> {
  return fetchJson<SummaryMetrics>('/api/admin/summary');
}

export interface CreateGroupInput {
  name: string;
  max_guests: number;
  notes?: string;
  custom_token?: string;
  guest_names?: string[];
}

export async function createAdminGroup(input: CreateGroupInput): Promise<GuestGroup> {
  return fetchJson<GuestGroup>('/api/admin/groups', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export interface UpdateGroupInput extends Partial<CreateGroupInput> {
  rsvp_status?: 'pending' | 'attending' | 'declined';
  confirmed_count?: number;
  dietary_requirements?: string;
}

export async function updateAdminGroup(
  id: string,
  input: UpdateGroupInput
): Promise<GuestGroup> {
  return fetchJson<GuestGroup>(`/api/admin/groups/${id}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  });
}

export async function deleteAdminGroup(id: string): Promise<{ success: boolean }> {
  return fetchJson<{ success: boolean }>(`/api/admin/groups/${id}`, {
    method: 'DELETE',
  });
}

export async function addAdminGuest(
  groupId: string,
  guest: { first_name: string; last_name?: string }
): Promise<GuestGroup> {
  return fetchJson<GuestGroup>(`/api/admin/groups/${groupId}/guests`, {
    method: 'POST',
    body: JSON.stringify(guest),
  });
}

export async function removeAdminGuest(guestId: string): Promise<{ success: boolean }> {
  return fetchJson<{ success: boolean }>(`/api/admin/guests/${guestId}`, {
    method: 'DELETE',
  });
}

// Public RSVP APIs
export async function fetchRsvpByToken(token: string): Promise<PublicRsvpResolveResponse> {
  return fetchJson<PublicRsvpResolveResponse>(`/api/rsvp/${encodeURIComponent(token)}`);
}

export async function submitRsvp(payload: SubmitRsvpPayload): Promise<{
  success: boolean;
  message: string;
  group: GuestGroup;
}> {
  return fetchJson<{
    success: boolean;
    message: string;
    group: GuestGroup;
  }>('/api/rsvp/submit', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function submitSongSuggestion(payload: {
  token: string;
  name: string;
  song: string;
  artist?: string;
}): Promise<{
  success: boolean;
  suggestion?: any;
  message?: string;
}> {
  return fetchJson<{
    success: boolean;
    suggestion?: any;
    message?: string;
  }>('/api/rsvp/suggest-song', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
