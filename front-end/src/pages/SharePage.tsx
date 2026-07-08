import { useState, type ChangeEvent, type SyntheticEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  getPublicDownloadUrl,
  type SharedFile,
  uploadSharedFile,
} from '../api/files'
import { AuthenticationError } from '../api/client'
import copyIcon from '../assets/icons/copy.svg'
import fileIcon from '../assets/icons/file.svg'
import uploadCloudIcon from '../assets/icons/upload-cloud.svg'
import { AppFooter } from '../components/AppFooter'
import { AppHeader } from '../components/AppHeader'
import { Button } from '../components/Button'
import { useAuthStore } from '../stores/authStore'
import { getErrorMessage } from '../utils/error'
import { formatFileSize } from '../utils/sharedFile'

export function SharePage() {
  const navigate = useNavigate()
  const token = useAuthStore((state) => state.token)
  const clearToken = useAuthStore((state) => state.clearToken)

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [sharedFile, setSharedFile] = useState<SharedFile | null>(null)

  const [error, setError] = useState('')
  const [copyStatus, setCopyStatus] = useState('')
  const [isUploading, setIsUploading] = useState(false)

  const isShareSheetOpen = selectedFile !== null || sharedFile !== null

  async function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault()

    if (token === null) {
      setError('Connectez-vous pour partager un fichier.')
      return
    }

    if (selectedFile === null) {
      setError('Sélectionnez un fichier.')
      return
    }

    setError('')
    setCopyStatus('')
    setIsUploading(true)

    try {
      const uploadedFile = await uploadSharedFile(selectedFile, token)
      setSharedFile(uploadedFile)
    } catch (caughtError) {
      if (caughtError instanceof AuthenticationError) {
        clearToken()
        navigate('/connexion', { replace: true })
        return
      }

      setError(getErrorMessage(caughtError))
    } finally {
      setIsUploading(false)
    }
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    setSelectedFile(event.target.files?.[0] ?? null)
    setSharedFile(null)
    setError('')
    setCopyStatus('')
  }

  function handleGuestFileClick(event: SyntheticEvent) {
    if (token !== null) {
      return
    }

    event.preventDefault()
    navigate('/connexion', {
      state: { message: 'Connectez-vous pour partager un fichier.' },
    })
  }

  async function copyLink(downloadToken: string) {
    await navigator.clipboard.writeText(getPublicDownloadUrl(downloadToken))
    setCopyStatus('Lien copié')
  }

  return (
    <div
      className={
        isShareSheetOpen ? 'share-layout share-layout--sheet' : 'share-layout'
      }
    >
      <AppHeader
        action={
          token === null ? (
            <Link className="app-header__action" to="/connexion">
              Se connecter
            </Link>
          ) : (
            <Link className="app-header__action" to="/mes-fichiers">
              Mon espace
            </Link>
          )
        }
      />
      <main className="share-layout__main">
        {selectedFile === null && sharedFile === null ? (
          <label className="share-dropzone" onClick={handleGuestFileClick}>
            <span className="share-dropzone__title">
              Tu veux partager un fichier ?
            </span>
            <span className="share-dropzone__button" aria-hidden="true">
              <img
                alt=""
                className="share-dropzone__icon"
                src={uploadCloudIcon}
              />
            </span>
            <input
              aria-label="Sélectionner un fichier"
              className="share-dropzone__input"
              name="file"
              type="file"
              onChange={handleFileChange}
            />
          </label>
        ) : (
          <form className="share-card" onSubmit={handleSubmit}>
            <h1 className="share-card__title">Ajouter un fichier</h1>
            <div className="share-card__file">
              <img alt="" className="share-card__icon" src={fileIcon} />
              <div className="share-card__file-text">
                <span className="share-card__file-name">
                  {sharedFile?.originalName ?? selectedFile?.name}
                </span>
                <span className="share-card__file-size">
                  {formatFileSize(sharedFile?.size ?? selectedFile?.size ?? 0)}
                </span>
              </div>
              <label className="share-card__change">
                Changer
                <input
                  aria-label="Changer de fichier"
                  className="share-card__change-input"
                  name="file"
                  type="file"
                  onChange={handleFileChange}
                />
              </label>
            </div>

            {sharedFile === null ? (
              <>
                {error && <p className="share-card__error">{error}</p>}
                <Button
                  className={
                    isUploading
                      ? 'button--share button--share-full'
                      : 'button--share'
                  }
                  disabled={isUploading}
                  type="submit"
                >
                  {isUploading ? 'Téléversement...' : 'Téléverser'}
                </Button>
              </>
            ) : (
              <>
                <p className="share-card__text">
                  Félicitations, ton fichier sera conservé chez nous pendant une
                  semaine !
                </p>
                <a
                  className="share-card__link"
                  href={getPublicDownloadUrl(sharedFile.downloadToken)}
                >
                  {getPublicDownloadUrl(sharedFile.downloadToken)}
                </a>
                <Button
                  className="button--share button--share-full"
                  onClick={() => {
                    void copyLink(sharedFile.downloadToken)
                  }}
                >
                  <img alt="" className="button__icon" src={copyIcon} />
                  Copier le lien
                </Button>
                {copyStatus && (
                  <span className="share-card__status">{copyStatus}</span>
                )}
              </>
            )}
          </form>
        )}
      </main>
      <AppFooter />
    </div>
  )
}
