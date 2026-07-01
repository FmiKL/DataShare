const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api'

type LoginPayload = {
  email: string
  password: string
}

type RegisterPayload = LoginPayload & {
  passwordConfirm: string
}

type LoginResponse = {
  token: string
}

type RegisterResponse = {
  email: string
  id: number
}

type ApiRequestPayload = LoginPayload | RegisterPayload

export function loginUser(payload: LoginPayload): Promise<LoginResponse> {
  return postJson('/auth/login', payload)
}

export function registerUser(
  payload: RegisterPayload,
): Promise<RegisterResponse> {
  return postJson('/auth/register', payload)
}

async function postJson<T>(
  path: string,
  payload: ApiRequestPayload,
): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const data = await readJsonResponse(response)

  if (!response.ok) {
    throw new Error(getApiErrorMessage(data))
  }

  return data as T
}

async function readJsonResponse(response: Response): Promise<unknown> {
  const content = await response.text()
  if (content === '') {
    return null
  }

  return JSON.parse(content) as unknown
}

function getApiErrorMessage(data: unknown): string {
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
