import { test, expect } from '@playwright/test';

test('imports leafgreen save and captures screenshot', async ({ page }) => {
    await page.setViewportSize({ width: 3840, height: 2160 });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const importButton = page.getByTestId('import-data-button');
    await importButton.waitFor();
    await importButton.click();

    const importDialog = page.getByRole('dialog', { name: /Import Nuzlocke Save/i });
    await expect(importDialog).toBeVisible();

    const jsonFileInput = importDialog.locator('input#jsonFile');
    await jsonFileInput.setInputFiles('e2e/nuzlockes/leafgreen.json');

    const confirmButton = importDialog.getByRole('button', { name: 'Confirm' });
    await expect(confirmButton).toBeEnabled();
    await confirmButton.click();

    await expect(importDialog).toBeHidden();

    await expect(page.getByText('Generations Locke')).toBeVisible();

    await page.screenshot({
        path: 'e2e/screenshots/leafgreen-import.png',
        fullPage: true,
    });
});

