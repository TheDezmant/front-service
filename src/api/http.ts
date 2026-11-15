export const API_URL: string = (import.meta.env.VITE_API_URL ?? 'http://localhost:4000').replace(/\/$/, '');

export interface ApiErrorDetail {
  readonly field: string;
  readonly message: string;
}

/** Ошибка API с HTTP-статусом и деталями валидации. */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details: readonly ApiErrorDetail[];

  constructor(status: number, code: string, message: string, details: readonly ApiErrorDetail[] = []) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

type UnauthorizedListener = () => void;
let token: string | null = null;
let onUnauthorized: UnauthorizedListener | null = null;

export const setAuthToken = (value: string | null): void => {
  token = value;
};
export const setUnauthorizedListener = (listener: UnauthorizedListener | null): void => {
  onUnauthorized = listener;
};

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null;

function parseError(status: number, body: unknown): ApiError {
  const err = isRecord(body) && isRecord(body.error) ? body.error : null;
  const message = typeof err?.message === 'string' ? err.message : `Ошибка запроса (${status})`;
  const code = typeof err?.code === 'string' ? err.code : 'UNKNOWN';
  const details = Array.isArray(err?.details)
    ? err.details.filter(
        (d): d is ApiErrorDetail => isRecord(d) && typeof d.field === 'string' && typeof d.message === 'string',
      )
    : [];
  return new ApiError(status, code, message, details);
}

/** Типизированная обёртка над fetch: JSON, токен, единая обработка ошибок. */
export async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const headers: Record<string, string> = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, 'NETWORK_ERROR', 'Сервер недоступен. Проверьте подключение.');
  }

  const text = await res.text();
  let data: unknown = undefined;
  if (text) {
    try {
      data = JSON.parse(text) as unknown;
    } catch {
      data = undefined;
    }
  }

  if (!res.ok) {
    if (res.status === 401 && token) onUnauthorized?.();
    throw parseError(res.status, data);
  }
  return data as T;
}
