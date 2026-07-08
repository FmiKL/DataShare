import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { AuthenticationError } from '../api/client'
import {
  deleteSharedFile,
  fetchSharedFiles,
  type SharedFile,
} from '../api/files'
import logOutIcon from '../assets/icons/log-out.svg'
import { AccountFileItem } from '../components/AccountFileItem'
import { AppFooter } from '../components/AppFooter'
import { useAuthStore } from '../stores/authStore'
import { getErrorMessage } from '../utils/error'
import { isFileExpired } from '../utils/sharedFile'

type FileFilter = 'active' | 'all' | 'expired'

export function UserFilesPage() {
  const navigate = useNavigate()
  const token = useAuthStore((state) => state.token)
  const clearToken = useAuthStore((state) => state.clearToken)

  const [files, setFiles] = useState<SharedFile[]>([])
  const [fileFilter, setFileFilter] = useState<FileFilter>('all')

  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [deletingFileId, setDeletingFileId] = useState<number | null>(null)

  const visibleFiles = files.filter((file) => filterFile(file, fileFilter))

  useEffect(() => {
    if (token === null) {
      return
    }

    const authToken = token

    async function loadFiles() {
      setError('')
      setIsLoading(true)

      try {
        const sharedFiles = await fetchSharedFiles(authToken)
        setFiles(sharedFiles)
      } catch (caughtError) {
        if (caughtError instanceof AuthenticationError) {
          clearToken()
          navigate('/connexion', { replace: true })

          return
        }

        setError(getErrorMessage(caughtError))
      } finally {
        setIsLoading(false)
      }
    }

    void loadFiles()
  }, [clearToken, navigate, token])

  if (token === null) {
    return <Navigate to="/connexion" replace />
  }

  const authToken = token

  function handleLogout() {
    clearToken()
    setIsMenuOpen(false)
  }

  async function handleDeleteFile(file: SharedFile) {
    const shouldDelete = window.confirm(`Supprimer ${file.originalName} ?`)

    if (!shouldDelete) {
      return
    }

    setError('')
    setDeletingFileId(file.id)

    try {
      await deleteSharedFile(file.id, authToken)
      setFiles((currentFiles) =>
        currentFiles.filter((currentFile) => currentFile.id !== file.id),
      )
    } catch (caughtError) {
      if (caughtError instanceof AuthenticationError) {
        clearToken()
        navigate('/connexion', { replace: true })

        return
      }

      setError(getErrorMessage(caughtError))
    } finally {
      setDeletingFileId(null)
    }
  }

  return (
    <div className="account-layout">
      <aside className="account-sidebar">
        <span className="account-sidebar__brand">DataShare</span>
        <nav className="account-sidebar__nav" aria-label="Navigation compte">
          <Link
            aria-current="page"
            className="account-sidebar__link"
            to="/mes-fichiers"
          >
            Mes fichiers
          </Link>
        </nav>
        <AppFooter />
      </aside>
      <div
        className={
          isMenuOpen ? 'account-drawer account-drawer--open' : 'account-drawer'
        }
      >
        <div className="account-drawer__header">
          <button
            aria-label="Fermer le menu"
            className="account-drawer__close"
            type="button"
            onClick={() => {
              setIsMenuOpen(false)
            }}
          >
            ×
          </button>
          <span className="account-drawer__brand">DataShare</span>
        </div>
        <nav className="account-drawer__nav" aria-label="Navigation mobile">
          <Link
            aria-current="page"
            className="account-drawer__link"
            to="/mes-fichiers"
            onClick={() => {
              setIsMenuOpen(false)
            }}
          >
            Mes fichiers
          </Link>
        </nav>
        <AppFooter />
      </div>
      {isMenuOpen && (
        <button
          aria-label="Fermer le menu"
          className="account-drawer__overlay"
          type="button"
          onClick={() => {
            setIsMenuOpen(false)
          }}
        />
      )}
      <div className="account-layout__content">
        <header className="account-header">
          <button
            aria-expanded={isMenuOpen}
            aria-label="Ouvrir le menu"
            className="account-header__menu"
            type="button"
            onClick={() => {
              setIsMenuOpen(true)
            }}
          >
            <span />
            <span />
            <span />
          </button>
          <div className="account-header__actions">
            <Link className="app-header__action" to="/">
              Ajouter des fichiers
            </Link>
            <button
              className="account-header__logout"
              type="button"
              onClick={handleLogout}
            >
              <img
                alt=""
                className="account-header__logout-icon"
                src={logOutIcon}
              />
              Déconnexion
            </button>
          </div>
        </header>
        <main className="account-layout__main">
          <section className="account-files" aria-labelledby="files-title">
            <h1 className="account-files__title" id="files-title">
              Mes fichiers
            </h1>

            <div className="account-files__tabs" aria-label="Filtres fichiers">
              <button
                aria-pressed={fileFilter === 'all'}
                className={getFilterClassName(fileFilter, 'all')}
                type="button"
                onClick={() => {
                  setFileFilter('all')
                }}
              >
                Tous
              </button>
              <button
                aria-pressed={fileFilter === 'active'}
                className={getFilterClassName(fileFilter, 'active')}
                type="button"
                onClick={() => {
                  setFileFilter('active')
                }}
              >
                Actifs
              </button>
              <button
                aria-pressed={fileFilter === 'expired'}
                className={getFilterClassName(fileFilter, 'expired')}
                type="button"
                onClick={() => {
                  setFileFilter('expired')
                }}
              >
                Expiré
              </button>
            </div>

            {error && <p className="account-files__error">{error}</p>}

            <div className="account-files__list" aria-live="polite">
              {isLoading ? (
                <p className="account-files__empty">
                  Chargement des fichiers...
                </p>
              ) : files.length === 0 ? (
                <p className="account-files__empty">
                  Aucun fichier pour le moment.
                </p>
              ) : visibleFiles.length === 0 ? (
                <p className="account-files__empty">
                  Aucun fichier dans cette vue.
                </p>
              ) : (
                visibleFiles.map((file) => (
                  <AccountFileItem
                    file={file}
                    isDeleting={deletingFileId === file.id}
                    key={file.id}
                    onDelete={handleDeleteFile}
                  />
                ))
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}

function filterFile(file: SharedFile, fileFilter: FileFilter): boolean {
  if (fileFilter === 'all') return true

  return fileFilter === 'expired' ? isFileExpired(file) : !isFileExpired(file)
}

function getFilterClassName(
  currentFilter: FileFilter,
  filter: FileFilter,
): string {
  return [
    'account-files__tab',
    currentFilter === filter ? 'account-files__tab--active' : '',
  ]
    .filter(Boolean)
    .join(' ')
}
