import { Navigate } from 'react-router-dom'
import { Button } from '../components/Button'
import { AppFooter } from '../components/AppFooter'
import { AppHeader } from '../components/AppHeader'
import { useAuthStore } from '../stores/authStore'

export function UserFilesPage() {
  const token = useAuthStore((state) => state.token)
  const clearToken = useAuthStore((state) => state.clearToken)

  if (token === null) {
    return <Navigate to="/connexion" replace />
  }

  return (
    <div className="app-layout">
      <AppHeader
        action={
          <Button onClick={clearToken} variant="header">
            Déconnexion
          </Button>
        }
      />
      <main className="app-layout__main">
        <section className="empty-state">
          <h1 className="empty-state__title">Mes fichiers</h1>
          <p className="empty-state__text">Aucun fichier pour le moment.</p>
        </section>
      </main>
      <AppFooter />
    </div>
  )
}
