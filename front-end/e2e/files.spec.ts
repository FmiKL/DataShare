import { expect, test, type Page } from '@playwright/test'

import { registerAndLogin } from './helpers/auth'

const FILE_NAME = 'document-e2e.txt'

async function uploadFile(page: Page) {
  await page.getByLabel('Sélectionner un fichier').setInputFiles({
    name: FILE_NAME,
    mimeType: 'text/plain',
    buffer: Buffer.from('document e2e'),
  })

  await page.getByRole('button', { name: 'Téléverser' }).click()
}

test('uploads a shared file', async ({ page }) => {
  await registerAndLogin(page)
  await uploadFile(page)
  await expect(page.getByText(/\/telechargement\//)).toBeVisible()
})

test('deletes a shared file', async ({ page }) => {
  await registerAndLogin(page)
  await uploadFile(page)

  await page.getByRole('link', { name: 'Mon espace' }).click()
  await expect(page.getByText(FILE_NAME)).toBeVisible()

  page.once('dialog', async (dialog) => {
    await dialog.accept()
  })

  await page.getByRole('button', { name: 'Supprimer' }).click()
  await expect(page.getByText(FILE_NAME)).not.toBeVisible()
})
