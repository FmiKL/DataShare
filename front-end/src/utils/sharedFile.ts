import type { SharedFile } from '../api/files'

const KILOBYTE = 1024
const MEGABYTE = KILOBYTE * 1024

export function formatFileSize(size: number): string {
  if (size < KILOBYTE) {
    return `${size} o`
  }

  if (size < MEGABYTE) {
    return `${(size / KILOBYTE).toFixed(1)} Ko`
  }

  return `${(size / MEGABYTE).toFixed(1)} Mo`
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
