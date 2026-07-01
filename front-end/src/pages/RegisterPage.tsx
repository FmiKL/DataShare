import { useState, type SyntheticEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { registerUser } from '../api/auth'
import { Button } from '../components/Button'
import { Panel } from '../components/Panel'
import { TextField } from '../components/TextField'
import { AuthLayout } from '../layouts/AuthLayout'
import { getErrorMessage } from '../utils/error'

export function RegisterPage() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')

  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault()

    setError('')
    setIsSubmitting(true)

    try {
      await registerUser({ email, password, passwordConfirm })
      navigate('/connexion', {
        state: { message: 'Votre compte a bien été créé.' },
      })
    } catch (caughtError) {
      setError(getErrorMessage(caughtError))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout actionLabel="Se connecter" actionTo="/connexion">
      <Panel title="Créer un compte">
        <form className="auth-form" onSubmit={handleSubmit}>
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
            autoComplete="new-password"
            label="Mot de passe"
            name="password"
            minLength={8}
            placeholder="Saisissez votre mot de passe..."
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
          <TextField
            autoComplete="new-password"
            label="Vérification du mot de passe"
            name="passwordConfirm"
            minLength={8}
            placeholder="Saisissez le à nouveau"
            type="password"
            value={passwordConfirm}
            onChange={(event) => setPasswordConfirm(event.target.value)}
            required
          />
          <Link className="auth-form__link" to="/connexion">
            J'ai déjà un compte
          </Link>
          <Button disabled={isSubmitting} type="submit">
            {isSubmitting ? 'Création...' : 'Créer mon compte'}
          </Button>
        </form>
      </Panel>
    </AuthLayout>
  )
}
