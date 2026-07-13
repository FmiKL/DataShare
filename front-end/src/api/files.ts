import {
  apiUrl,
  AuthenticationError,
  getApiErrorMessage,
  readJsonResponse,
} from './client'

export type SharedFile = {
  createdAt: string
  downloadToken: string
  expiresAt: string
  id: number
  mimeType: string
  originalName: string
  size: number
}

export type SharedFileMetadata = Omit<SharedFile, 'downloadToken' | 'id'>

export async function fetchSharedFiles(token: string): Promise<SharedFile[]> {
  const response = await fetch(apiUrl('/files'), {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })

  const data = await readJsonResponse(response)

  if (response.status === 401) {
    throw new AuthenticationError(getApiErrorMessage(data))
  }

  if (!response.ok) {
    throw new Error(getApiErrorMessage(data))
  }

  if (!Array.isArray(data)) {
    throw new Error('Une erreur est survenue.')
  }

  return data as SharedFile[]
}

export async function uploadSharedFile(
  file: File,
  token: string,
): Promise<SharedFile> {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch(apiUrl('/files'), {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  })

  const data = await readJsonResponse(response)

  if (response.status === 401) {
    throw new AuthenticationError(getApiErrorMessage(data))
  }

  if (!response.ok) {
    throw new Error(getApiErrorMessage(data))
  }

  return data as SharedFile
}

export async function deleteSharedFile(
  id: number,
  token: string,
): Promise<void> {
  const response = await fetch(apiUrl(`/files/${id}`), {
    method: 'DELETE',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })

  const data = await readJsonResponse(response)

  if (response.status === 401) {
    throw new AuthenticationError(getApiErrorMessage(data))
  }

  if (!response.ok) {
    throw new Error(getApiErrorMessage(data))
  }
}

export async function fetchSharedFileMetadata(
  downloadToken: string,
): Promise<SharedFileMetadata> {
  const response = await fetch(apiUrl(`/files/${downloadToken}/metadata`), {
    headers: {
      Accept: 'application/json',
    },
  })

  const data = await readJsonResponse(response)

  if (!response.ok) {
    throw new Error(getApiErrorMessage(data))
  }

  return data as SharedFileMetadata
}

export function getApiDownloadUrl(downloadToken: string): string {
  return apiUrl(`/files/${downloadToken}/download`)
}

export function getPublicDownloadUrl(downloadToken: string): string {
  return `${window.location.origin}/telechargement/${downloadToken}`
}
