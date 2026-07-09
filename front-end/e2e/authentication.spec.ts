import { test } from '@playwright/test'

import { registerAndLogin } from './helpers/auth'

test('registers and logs in a user', async ({ page }) => {
  await registerAndLogin(page)
})
