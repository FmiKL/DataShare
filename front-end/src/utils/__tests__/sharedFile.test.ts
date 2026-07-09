import { describe, expect, it } from 'vitest'
import {
  formatExpirationDate,
  formatFileSize,
  isFileExpired,
} from '../sharedFile'

const MEGABYTE = 1024 * 1024
const ONE_MINUTE_IN_MILLISECONDS = 60 * 1000

function expiredDate(): string {
  return new Date(Date.now() - ONE_MINUTE_IN_MILLISECONDS).toISOString()
}

function futureDate(): string {
  return new Date(Date.now() + ONE_MINUTE_IN_MILLISECONDS).toISOString()
}

describe('shared file utilities', () => {
  it('formats file sizes', () => {
    expect(formatFileSize(512)).toBe('512 o')
    expect(formatFileSize(1536)).toBe('1.5 Ko')
    expect(formatFileSize(2 * MEGABYTE)).toBe('2.0 Mo')
  })

  it('detects expired files', () => {
    expect(isFileExpired({ expiresAt: expiredDate() })).toBe(true)
    expect(isFileExpired({ expiresAt: futureDate() })).toBe(false)
  })

  it('formats expiration dates in French', () => {
    expect(formatExpirationDate('2026-07-09T12:30:00.000Z')).toContain(
      '09/07/2026',
    )
  })
})
