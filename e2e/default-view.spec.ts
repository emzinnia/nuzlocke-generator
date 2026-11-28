import { test, expect } from '@playwright/test';

test('captures screenshot of default page view', async ({ page }) => {
    // Set viewport to 4k size
    await page.setViewportSize({ width: 3840, height: 2160 });

    await page.goto('/');

    // Wait for the page to be fully loaded (may redirect)
    await page.waitForLoadState('networkidle');

    // Take a screenshot of the default view
    await page.screenshot({
        path: 'e2e/screenshots/default-view.png',
        fullPage: true,
    });

    // Verify the page loaded successfully (app redirects to beta-login)
    await expect(page).toHaveURL(/localhost:8080/);
});

