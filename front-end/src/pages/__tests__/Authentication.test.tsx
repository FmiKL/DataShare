import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../../App'
import { useAuthStore } from '../../stores/authStore'

const USER_EMAIL = 'john.doe@example.com'
const USER_PASSWORD = 'password'
const INVALID_PASSWORD = 'wrong-password'
const AUTH_TOKEN = 'jwt-token'

function renderApp(path = '/connexion') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  )
}

function mockJsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    headers: { 'Content-Type': 'application/json' },
    status,
  })
}

describe('Authentication', () => {
  beforeEach(() => {
    localStorage.clear()
    useAuthStore.setState({ token: null })
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('redirects users unauthenticated to the login page', async () => {
    renderApp('/mes-fichiers')

    expect(
      await screen.findByRole('heading', { name: 'Connexion' }),
    ).toBeInTheDocument()
  })

  it('registers a user and redirects to the login page', async () => {
    const user = userEvent.setup()

    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(mockJsonResponse({ email: USER_EMAIL, id: 1 }))

    renderApp('/creer-un-compte')

    await user.type(screen.getByLabelText('Email'), USER_EMAIL)
    await user.type(screen.getByLabelText('Mot de passe'), USER_PASSWORD)
    await user.type(
      screen.getByLabelText('Vérification du mot de passe'),
      USER_PASSWORD,
    )
    await user.click(screen.getByRole('button', { name: 'Créer mon compte' }))

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        'http://localhost:8000/api/auth/register',
        expect.objectContaining({
          body: JSON.stringify({
            email: USER_EMAIL,
            password: USER_PASSWORD,
            passwordConfirm: USER_PASSWORD,
          }),
          method: 'POST',
        }),
      )
    })

    expect(
      await screen.findByText('Votre compte a bien été créé.'),
    ).toBeInTheDocument()
  })

  it('authenticates a user and stores the token', async () => {
    const user = userEvent.setup()
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      mockJsonResponse({ token: AUTH_TOKEN }),
    )

    renderApp('/connexion')

    await user.type(screen.getByLabelText('Email'), USER_EMAIL)
    await user.type(screen.getByLabelText('Mot de passe'), USER_PASSWORD)
    await user.click(screen.getByRole('button', { name: 'Connexion' }))

    expect(
      await screen.findByRole('heading', { name: 'Mes fichiers' }),
    ).toBeInTheDocument()

    expect(localStorage.getItem('datashare.authToken')).toBe(AUTH_TOKEN)
  })

  it('displays login errors returned by the API', async () => {
    const user = userEvent.setup()
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      mockJsonResponse({ message: 'Identifiants invalides.' }, 401),
    )

    renderApp('/connexion')

    await user.type(screen.getByLabelText('Email'), USER_EMAIL)
    await user.type(screen.getByLabelText('Mot de passe'), INVALID_PASSWORD)
    await user.click(screen.getByRole('button', { name: 'Connexion' }))

    expect(
      await screen.findByText('Identifiants invalides.'),
    ).toBeInTheDocument()
  })
})
