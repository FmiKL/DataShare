import { apiUrl, getApiErrorMessage, readJsonResponse } from './client'

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
  const response = await fetch(apiUrl(path), {
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
