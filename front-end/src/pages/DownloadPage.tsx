import { Link, useParams } from 'react-router-dom'
import { getApiDownloadUrl } from '../api/files'
import { AppFooter } from '../components/AppFooter'
import { AppHeader } from '../components/AppHeader'
import { useAuthStore } from '../stores/authStore'

export function DownloadPage() {
  const { downloadToken } = useParams()
  const token = useAuthStore((state) => state.token)
  const downloadUrl = downloadToken ? getApiDownloadUrl(downloadToken) : ''

  return (
    <div className="share-layout">
      <AppHeader
        action={
          <Link
            className="app-header__action"
            to={token === null ? '/connexion' : '/mes-fichiers'}
          >
            {token === null ? 'Connexion' : 'Mon espace'}
          </Link>
        }
      />
      <main className="share-layout__main">
        <section className="download-card">
          <h1 className="download-card__title">Télécharger un fichier</h1>
          {downloadToken ? (
            <>
              <p className="download-card__text">Votre fichier est prêt.</p>
              <a
                className="button button--primary download-card__button"
                href={downloadUrl}
              >
                Télécharger
              </a>
            </>
          ) : (
            <p className="download-card__error">Ce lien est invalide.</p>
          )}
        </section>
      </main>
      <AppFooter />
    </div>
  )
}
