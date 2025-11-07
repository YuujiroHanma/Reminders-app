import { test, expect } from '@playwright/test'

test('homepage shows reminders header', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('h1')).toHaveText(/Reminders/)
})
