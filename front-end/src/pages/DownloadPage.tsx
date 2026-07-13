import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  fetchSharedFileMetadata,
  getApiDownloadUrl,
  type SharedFileMetadata,
} from '../api/files'
import { AppFooter } from '../components/AppFooter'
import { AppHeader } from '../components/AppHeader'
import { useAuthStore } from '../stores/authStore'
import { getErrorMessage } from '../utils/error'
import {
  formatExpirationDate,
  formatFileSize,
  isFileExpired,
} from '../utils/sharedFile'

export function DownloadPage() {
  const { downloadToken } = useParams()
  const token = useAuthStore((state) => state.token)
  const downloadUrl = downloadToken ? getApiDownloadUrl(downloadToken) : ''
  const [fileMetadata, setFileMetadata] = useState<SharedFileMetadata | null>(
    null,
  )
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(downloadToken !== undefined)

  useEffect(() => {
    if (downloadToken === undefined) {
      setError('')
      setFileMetadata(null)
      setIsLoading(false)

      return
    }

    const currentDownloadToken = downloadToken
    let isMounted = true

    async function loadMetadata() {
      setError('')
      setFileMetadata(null)
      setIsLoading(true)

      try {
        const metadata = await fetchSharedFileMetadata(currentDownloadToken)

        if (isMounted) {
          setFileMetadata(metadata)
        }
      } catch (caughtError) {
        if (isMounted) {
          setError(getErrorMessage(caughtError))
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadMetadata()

    return () => {
      isMounted = false
    }
  }, [downloadToken])

  const expired = fileMetadata ? isFileExpired(fileMetadata) : false

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
          {downloadToken === undefined ? (
            <p className="download-card__error">Ce lien est invalide.</p>
          ) : isLoading ? (
            <p className="download-card__text">Chargement du fichier...</p>
          ) : error ? (
            <p className="download-card__error">{error}</p>
          ) : fileMetadata ? (
            <>
              <div className="download-card__metadata">
                <p className="download-card__file-name">
                  {fileMetadata.originalName}
                </p>
                <p className="download-card__text">
                  {fileMetadata.mimeType} - {formatFileSize(fileMetadata.size)}
                </p>
                <p className="download-card__text">
                  Expire le {formatExpirationDate(fileMetadata.expiresAt)}
                </p>
              </div>
              {expired ? (
                <p className="download-card__error">Ce lien a expiré.</p>
              ) : (
                <a
                  className="button button--primary download-card__button"
                  href={downloadUrl}
                >
                  Télécharger
                </a>
              )}
            </>
          ) : (
            <p className="download-card__error">Ce fichier est introuvable.</p>
          )}
        </section>
      </main>
      <AppFooter />
    </div>
  )
}
