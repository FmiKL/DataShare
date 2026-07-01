import { expect, test } from '@playwright/test'

const USER_PASSWORD = 'password'

test('registers and logs in a user', async ({ page }) => {
  const email = `john.doe+${Date.now()}@example.com`

  await page.goto('/creer-un-compte')
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Mot de passe', { exact: true }).fill(USER_PASSWORD)
  await page.getByLabel('Vérification du mot de passe').fill(USER_PASSWORD)
  await page.getByRole('button', { name: 'Créer mon compte' }).click()

  await expect(page.getByRole('heading', { name: 'Connexion' })).toBeVisible()
  await expect(page.getByText('Votre compte a bien été créé.')).toBeVisible()

  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Mot de passe').fill(USER_PASSWORD)
  await page.getByRole('button', { name: 'Connexion' }).click()

  await expect(page).toHaveURL('/mes-fichiers')
  await expect(
    page.getByRole('heading', { name: 'Mes fichiers' }),
  ).toBeVisible()
})
