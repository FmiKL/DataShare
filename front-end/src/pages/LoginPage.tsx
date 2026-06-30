import { Link } from 'react-router-dom'
import { Button } from '../components/Button'
import { Panel } from '../components/Panel'
import { TextField } from '../components/TextField'
import { AuthLayout } from '../layouts/AuthLayout'

export function LoginPage() {
  return (
    <AuthLayout actionLabel="Se connecter" actionTo="/connexion">
      <Panel title="Connexion">
        <form className="auth-form">
          <TextField
            autoComplete="email"
            label="Email"
            name="email"
            placeholder="Saisissez votre email..."
            type="email"
          />
          <TextField
            autoComplete="current-password"
            label="Mot de passe"
            name="password"
            placeholder="Saisissez votre mot de passe..."
            type="password"
          />
          <Link className="auth-form__link" to="/creer-un-compte">
            Créer un compte
          </Link>
          <Button type="submit">Connexion</Button>
        </form>
      </Panel>
    </AuthLayout>
  )
}
