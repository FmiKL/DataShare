import { useState } from 'react'
import { getPublicDownloadUrl, type SharedFile } from '../api/files'
import arrowRightIcon from '../assets/icons/arrow-right.svg'
import copyIcon from '../assets/icons/copy.svg'
import fileIcon from '../assets/icons/file.svg'
import moreVerticalIcon from '../assets/icons/more-vertical.svg'
import trashIcon from '../assets/icons/trash.svg'
import {
  formatExpirationDate,
  formatFileDate,
  formatFileSize,
  isFileExpired,
} from '../utils/sharedFile'

type AccountFileItemProps = {
  file: SharedFile
  isDeleting?: boolean
  onDelete: (file: SharedFile) => void
}

export function AccountFileItem({
  file,
  isDeleting = false,
  onDelete,
}: AccountFileItemProps) {
  const [copyStatus, setCopyStatus] = useState('')
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const publicDownloadUrl = getPublicDownloadUrl(file.downloadToken)
  const expired = isFileExpired(file)
  const menuId = `file-actions-${file.id}`

  async function copyLink() {
    await navigator.clipboard.writeText(publicDownloadUrl)
    setCopyStatus('Lien copié')
    setIsMenuOpen(false)
  }

  function deleteFile() {
    setIsMenuOpen(false)
    onDelete(file)
  }

  return (
    <article className="account-file">
      <img alt="" className="account-file__icon" src={fileIcon} />
      <div className="account-file__content">
        <h2 className="account-file__name">{file.originalName}</h2>
        <p className="account-file__details">
          {formatFileSize(file.size)} - Envoyé le{' '}
          {formatFileDate(file.createdAt)}
        </p>
        <p className="account-file__meta">
          {expired
            ? 'Expiré'
            : `Expire le ${formatExpirationDate(file.expiresAt)}`}
        </p>
      </div>
      <div className="account-file__actions">
        {expired ? (
          <span className="account-file__expired-message">
            Ce fichier a expiré, il n'est plus stocké chez nous
          </span>
        ) : (
          <>
            <button
              aria-label="Copier le lien"
              className="account-file__copy"
              type="button"
              onClick={copyLink}
            >
              <img alt="" className="account-file__copy-icon" src={copyIcon} />
            </button>
            <button
              className="account-file__delete"
              disabled={isDeleting}
              type="button"
              onClick={deleteFile}
            >
              <img alt="" className="button__icon" src={trashIcon} />
              {isDeleting ? 'Suppression...' : 'Supprimer'}
            </button>
            <a className="account-file__access" href={publicDownloadUrl}>
              Accéder
              <img alt="" className="button__icon" src={arrowRightIcon} />
            </a>
            <button
              aria-controls={menuId}
              aria-expanded={isMenuOpen}
              aria-label="Options du fichier"
              className="account-file__menu"
              type="button"
              onClick={() => {
                setIsMenuOpen(!isMenuOpen)
              }}
            >
              <img
                alt=""
                className="account-file__menu-icon"
                src={moreVerticalIcon}
              />
            </button>
            {isMenuOpen && (
              <div className="account-file__menu-popover" id={menuId}>
                <button
                  className="account-file__menu-item"
                  disabled={isDeleting}
                  type="button"
                  onClick={deleteFile}
                >
                  {isDeleting ? 'Suppression...' : 'Supprimer'}
                </button>
                <a className="account-file__menu-item" href={publicDownloadUrl}>
                  Accéder
                </a>
              </div>
            )}
          </>
        )}
        {copyStatus && (
          <span className="account-file__status">{copyStatus}</span>
        )}
      </div>
    </article>
  )
}
