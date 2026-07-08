import type { SharedFile } from '../api/files'

export function formatFileSize(size: number): string {
  if (size < 1024) {
    return `${size} o`
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} Ko`
  }

  return `${(size / (1024 * 1024)).toFixed(1)} Mo`
}

export function formatExpirationDate(date: string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(date))
}

export function isFileExpired(file: Pick<SharedFile, 'expiresAt'>): boolean {
  return new Date(file.expiresAt).getTime() < Date.now()
}
