import { Link } from 'react-router-dom'
import { Button } from '../components/Button'
import { Panel } from '../components/Panel'
import { TextField } from '../components/TextField'
import { AuthLayout } from '../layouts/AuthLayout'

export function RegisterPage() {
  return (
    <AuthLayout actionLabel="Se connecter" actionTo="/connexion">
      <Panel title="Créer un compte">
        <form className="auth-form">
          <TextField
            autoComplete="email"
            label="Email"
            name="email"
            placeholder="Saisissez votre email..."
            type="email"
          />
          <TextField
            autoComplete="new-password"
            label="Mot de passe"
            name="password"
            placeholder="Saisissez votre mot de passe..."
            type="password"
          />
          <TextField
            autoComplete="new-password"
            label="Vérification du mot de passe"
            name="passwordConfirm"
            placeholder="Saisissez le à nouveau"
            type="password"
          />
          <Link className="auth-form__link" to="/connexion">
            J'ai déjà un compte
          </Link>
          <Button type="submit">Créer mon compte</Button>
        </form>
      </Panel>
    </AuthLayout>
  )
}
