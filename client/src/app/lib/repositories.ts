import type { AnalyzedRepository } from '@/app/types/repository';

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'
).replace(/\/$/, '');

export async function analyzeRepository(
  repositoryUrl: string,
): Promise<AnalyzedRepository> {
  const params = new URLSearchParams({
    url: repositoryUrl,
  });

  const response = await fetch(
    `${API_BASE_URL}/api/repositories/analyze?${params.toString()}`,
  );

  const payload: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      typeof payload === 'object' &&
      payload !== null &&
      'message' in payload
        ? (payload as { message?: unknown }).message
        : undefined;

    if (Array.isArray(message)) {
      throw new Error(message.join(', '));
    }

    if (typeof message === 'string') {
      throw new Error(message);
    }

    throw new Error(`Request failed with status ${response.status}.`);
  }

  if (payload === null || typeof payload !== 'object') {
    throw new Error('The backend returned an invalid response.');
  }

  return payload as AnalyzedRepository;
}