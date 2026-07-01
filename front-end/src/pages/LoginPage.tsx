import { useState, type SyntheticEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { loginUser } from '../api/auth'
import { Button } from '../components/Button'
import { Panel } from '../components/Panel'
import { TextField } from '../components/TextField'
import { AuthLayout } from '../layouts/AuthLayout'
import { useAuthStore } from '../stores/authStore'
import { getErrorMessage } from '../utils/error'

type LocationState = {
  message?: string
}

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const setToken = useAuthStore((state) => state.setToken)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const message = (location.state as LocationState | null)?.message

  async function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const response = await loginUser({ email, password })
      setToken(response.token)
      navigate('/mes-fichiers')
    } catch (caughtError) {
      setError(getErrorMessage(caughtError))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout actionLabel="Se connecter" actionTo="/connexion">
      <Panel title="Connexion">
        <form className="auth-form" onSubmit={handleSubmit}>
          {message && <p className="auth-form__success">{message}</p>}
          {error && <p className="auth-form__error">{error}</p>}
          <TextField
            autoComplete="email"
            label="Email"
            name="email"
            placeholder="Saisissez votre email..."
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <TextField
            autoComplete="current-password"
            label="Mot de passe"
            name="password"
            placeholder="Saisissez votre mot de passe..."
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
          <Link className="auth-form__link" to="/creer-un-compte">
            Créer un compte
          </Link>
          <Button disabled={isSubmitting} type="submit">
            {isSubmitting ? 'Connexion...' : 'Connexion'}
          </Button>
        </form>
      </Panel>
    </AuthLayout>
  )
}
