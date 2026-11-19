import type { CarNotification, ExplanationResponse, Property, SurveyAnalysis, SurveyPoint } from './types';

const BASE_URL = (process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000').replace(/\/$/, '');

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      ...init,
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    });
    const body = (await response.json().catch(() => null)) as unknown;
    if (!response.ok) {
      const message = (body as { message?: string | string[] } | null)?.message;
      throw new ApiError(response.status, Array.isArray(message) ? message.join('\n') : (message ?? 'Erro no servidor'));
    }
    return body as T;
  } finally {
    clearTimeout(timeout);
  }
}

export const api = {
  demoProperty: () => request<Property>('/v1/properties/demo'),
  notifications: (propertyId: string) => request<CarNotification[]>(`/v1/properties/${propertyId}/notifications`),
  explain: (notificationId: string) => request<ExplanationResponse>(`/v1/notifications/${notificationId}/explanation`, { method: 'POST' }),
  createSurvey: (input: { propertyId: string; clientId: string; collectedAt: string; points: SurveyPoint[] }) =>
    request<SurveyAnalysis>('/v1/surveys', { method: 'POST', body: JSON.stringify(input) }),
};
