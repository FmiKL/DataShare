import { cleanup, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useAuthStore } from '../../stores/authStore'
import { mockJsonResponse, renderApp } from '../../test/helpers'

const API_FILES_URL = 'http://localhost:8000/api/files'

const AUTH_TOKEN = 'jwt-token'
const DOWNLOAD_TOKEN = 'downloadtoken'.repeat(5) + '1234'

const DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000
const FILE_RETENTION_DAYS = 7

const SHARED_FILE = {
  downloadToken: DOWNLOAD_TOKEN,
  expiresAt: futureExpirationDate(),
  id: 1,
  mimeType: 'text/plain',
  originalName: 'document.txt',
  size: 7,
}

function futureExpirationDate(): string {
  return new Date(
    Date.now() + FILE_RETENTION_DAYS * DAY_IN_MILLISECONDS,
  ).toISOString()
}

function pastExpirationDate(): string {
  return new Date(Date.now() - DAY_IN_MILLISECONDS).toISOString()
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

  it('displays public download link', async () => {
    renderApp(`/telechargement/${DOWNLOAD_TOKEN}`)

    expect(
      screen.getByRole('heading', { name: 'Télécharger un fichier' }),
    ).toBeInTheDocument()

    expect(screen.getByRole('link', { name: 'Télécharger' })).toHaveAttribute(
      'href',
      `http://localhost:8000/api/files/${DOWNLOAD_TOKEN}/download`,
    )
  })

  it('deletes a user file', async () => {
    const user = userEvent.setup()
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(mockJsonResponse([SHARED_FILE]))
      .mockResolvedValueOnce(new Response(null, { status: 204 }))

    vi.spyOn(window, 'confirm').mockReturnValue(true)

    renderApp('/mes-fichiers')

    expect(await screen.findByText('document.txt')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Supprimer' }))

    await waitFor(() => {
      expect(screen.queryByText('document.txt')).not.toBeInTheDocument()
    })

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_FILES_URL}/${SHARED_FILE.id}`,
      expect.objectContaining({ method: 'DELETE' }),
    )
  })

  it('displays expired file message', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      mockJsonResponse([{ ...SHARED_FILE, expiresAt: pastExpirationDate() }]),
    )

    renderApp('/mes-fichiers')

    expect(
      await screen.findByText(
        "Ce fichier a expiré, il n'est plus stocké chez nous",
      ),
    ).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Supprimer' })).toBeNull()
    expect(screen.queryByRole('link', { name: /Accéder/ })).toBeNull()
  })
})
