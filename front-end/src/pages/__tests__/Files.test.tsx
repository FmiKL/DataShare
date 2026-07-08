import { cleanup, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useAuthStore } from '../../stores/authStore'
import { mockJsonResponse, renderApp } from '../../test/helpers'

const API_FILES_URL = 'http://localhost:8000/api/files'

const AUTH_TOKEN = 'jwt-token'
const DOWNLOAD_TOKEN = 'downloadtoken'.repeat(5) + '1234'

const SHARED_FILE = {
  downloadToken: DOWNLOAD_TOKEN,
  expiresAt: futureDate(),
  id: 1,
  mimeType: 'text/plain',
  originalName: 'document.txt',
  size: 7,
}

function futureDate(): string {
  return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
}

describe('Files', () => {
  beforeEach(() => {
    localStorage.clear()
    useAuthStore.setState({ token: AUTH_TOKEN })
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('loads authenticated user files', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(mockJsonResponse([SHARED_FILE]))

    renderApp('/mes-fichiers')

    expect(await screen.findByText('document.txt')).toBeInTheDocument()

    expect(fetchMock).toHaveBeenCalledWith(
      API_FILES_URL,
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: `Bearer ${AUTH_TOKEN}`,
        }),
      }),
    )
  })

  it('redirects to login when user token is rejected', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      mockJsonResponse({ message: 'Expired JWT Token' }, 401),
    )

    renderApp('/mes-fichiers')

    expect(
      await screen.findByRole('heading', { name: 'Connexion' }),
    ).toBeInTheDocument()
    expect(useAuthStore.getState().token).toBeNull()
  })

  it('uploads file and displays its public link', async () => {
    const user = userEvent.setup()
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(mockJsonResponse(SHARED_FILE, 201))

    renderApp('/')

    await user.upload(
      screen.getByLabelText('Sélectionner un fichier'),
      new File(['hello!!'], 'document.txt', { type: 'text/plain' }),
    )
    await user.click(screen.getByRole('button', { name: 'Téléverser' }))

    const publicDownloadUrl = `${window.location.origin}/telechargement/${DOWNLOAD_TOKEN}`

    expect(await screen.findByText(publicDownloadUrl)).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledWith(
      API_FILES_URL,
      expect.objectContaining({
        body: expect.any(FormData),
        method: 'POST',
      }),
    )
  })
})
