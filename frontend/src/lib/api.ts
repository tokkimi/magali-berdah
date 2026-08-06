// En dev le proxy Vite redirige /api → localhost:3001
// En prod (Vercel experimentalServices) le backend est sur le même domaine via routePrefix /api
const BASE = import.meta.env.VITE_API_URL || '';

export const API = BASE + '/api';

function getToken() {
  return localStorage.getItem('mb_token');
}

async function request(method: string, path: string, body?: any) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(API + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Erreur serveur');
  return data;
}

export const api = {
  get: (p: string) => request('GET', p),
  post: (p: string, b?: any) => request('POST', p, b),
  put: (p: string, b?: any) => request('PUT', p, b),
  delete: (p: string) => request('DELETE', p),
};

export async function uploadFile(file: File): Promise<string> {
  const form = new FormData();
  form.append('file', file);
  const token = getToken();
  const res = await fetch(`${API}/upload`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Upload échoué');
  return data.url;
}

export async function uploadFiles(files: File[]): Promise<string[]> {
  const form = new FormData();
  files.forEach(f => form.append('files', f));
  const token = getToken();
  const res = await fetch(`${API}/upload/multiple`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Upload échoué');
  return data.urls || [];
}

export function imgUrl(url: string) {
  if (!url) return `${BASE}/api/placeholder/600/800`;
  if (url.startsWith('http')) return url;
  return BASE + url;
}
