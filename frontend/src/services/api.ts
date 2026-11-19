// Em dev, o Vite roda em outra porta que o backend Express.
// Configure VITE_API_URL no arquivo .env (veja .env.example) se o backend
// não estiver em http://localhost:3333.
const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3333'

export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  let data: unknown = null
  try {
    data = await res.json()
  } catch {
    // resposta sem corpo (ex: 204) — segue sem dado
  }

  if (!res.ok) {
    const message =
      data && typeof data === 'object' && 'message' in data
        ? String((data as { message: unknown }).message)
        : 'Erro ao comunicar com o servidor.'
    throw new ApiError(message, res.status)
  }

  return data as T
}

export const api = {
  post: <T>(path: string, body: unknown, token?: string | null) =>
    request<T>(path, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    }),
  patch: <T>(path: string, body: unknown, token?: string | null) =>
    request<T>(path, {
      method: 'PATCH',
      body: JSON.stringify(body),
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    }),
  get: <T>(path: string, token?: string | null) =>
    request<T>(path, {
      method: 'GET',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    }),
}
