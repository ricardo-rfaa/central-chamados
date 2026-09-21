// Lógica idêntica à versão web (src/services/api.ts) — só a leitura da
// URL base muda, porque o Expo usa process.env.EXPO_PUBLIC_* em vez do
// import.meta.env.VITE_* do Vite. Configure EXPO_PUBLIC_API_URL no .env
// se o backend não estiver acessível em http://localhost:3333.
//
// Atenção mobile: "localhost" dentro do emulador/celular não é o mesmo
// "localhost" do computador rodando o backend. Use o IP da máquina na
// rede local (ex: http://192.168.0.10:3333) ao testar em dispositivo
// físico ou emulador — só funciona sem isso no Android Studio emulator,
// que mapeia 10.0.2.2 para o localhost do host automaticamente.
const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3333'

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
