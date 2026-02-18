const API_BASE = '/api';

function getToken(): string | null {
  return localStorage.getItem('token');
}

function authHeaders(): HeadersInit {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Error del servidor' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

// Auth
export const login = (username: string, password: string) =>
  request<{ token: string; user: { id: string; username: string; role: string } }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });

export const getMe = () => request<{ userId: string; username: string; role: string }>('/auth/me');

// Scandals
export const getScandals = () => request<any[]>('/scandals');
export const getScandal = (id: string) => request<any>(`/scandals/${id}`);
export const getScandalBoard = (id: string) => request<any>(`/scandals/${id}/board`);
export const createScandal = (data: { name: string; description: string; color?: string }) =>
  request<any>('/scandals', { method: 'POST', body: JSON.stringify(data) });
export const updateScandal = (id: string, data: any) =>
  request<any>(`/scandals/${id}`, { method: 'PUT', body: JSON.stringify(data) });

// People
export const getPeople = () => request<any[]>('/people');
export const getPerson = (id: string) => request<any>(`/people/${id}`);
export const createPerson = (data: { name: string; role_title?: string; description?: string }) =>
  request<any>('/people', { method: 'POST', body: JSON.stringify(data) });
export const updatePerson = (id: string, data: any) =>
  request<any>(`/people/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const linkPersonToScandal = (personId: string, scandalId: string, relationship: string) =>
  request<any>(`/people/${personId}/scandals/${scandalId}`, {
    method: 'POST',
    body: JSON.stringify({ relationship }),
  });

// Tips
export async function submitTip(data: {
  scandal_id: string;
  description: string;
  person_name_suggestion?: string;
  files: File[];
}): Promise<any> {
  const formData = new FormData();
  formData.append('scandal_id', data.scandal_id);
  formData.append('description', data.description);
  if (data.person_name_suggestion) {
    formData.append('person_name_suggestion', data.person_name_suggestion);
  }
  for (const file of data.files) {
    formData.append('files', file);
  }

  const res = await fetch(`${API_BASE}/tips`, {
    method: 'POST',
    body: formData,
    // No Content-Type header - browser sets it with boundary
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Error' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export const getTips = (status?: string, scandalId?: string) => {
  const params = new URLSearchParams();
  if (status) params.append('status', status);
  if (scandalId) params.append('scandal_id', scandalId);
  return request<any[]>(`/tips?${params.toString()}`);
};

export const getTip = (id: string) => request<any>(`/tips/${id}`);

export const approveTip = (id: string, data: any) =>
  request<any>(`/tips/${id}/approve`, { method: 'POST', body: JSON.stringify(data) });

export const rejectTip = (id: string, review_note?: string) =>
  request<any>(`/tips/${id}/reject`, { method: 'POST', body: JSON.stringify({ review_note }) });

// Evidence
export const getEvidenceForScandal = (scandalId: string) =>
  request<any[]>(`/evidence/scandal/${scandalId}`);
