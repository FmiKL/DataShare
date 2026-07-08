export const API_URL =
  import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api'

export class AuthenticationError extends Error {}

export function apiUrl(path: string): string {
  return `${API_URL}${path}`
}

export async function readJsonResponse(response: Response): Promise<unknown> {
  const content = await response.text()
  if (content === '') return null

  return JSON.parse(content) as unknown
}

export function getApiErrorMessage(data: unknown): string {
  if (!isRecord(data)) {
    return 'Une erreur est survenue.'
  }

  if (typeof data.message === 'string') {
    return data.message
  }

  if (typeof data.detail === 'string') {
    return data.detail
  }

  return 'Une erreur est survenue.'
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}
