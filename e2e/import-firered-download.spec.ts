import { test, expect } from '@playwright/test';
import fs from 'fs/promises';
import path from 'path';

test.use({ acceptDownloads: true });

test('imports firered save, downloads image, and matches expected render', async ({ page }) => {
    await page.setViewportSize({ width: 3840, height: 2160 });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const importButton = page.getByTestId('import-data-button');
    await importButton.waitFor();
    await importButton.click();

    const importDialog = page.getByRole('dialog', { name: /Import Nuzlocke Save/i });
    await expect(importDialog).toBeVisible();

    const jsonFileInput = importDialog.locator('input#jsonFile');
    await jsonFileInput.setInputFiles('e2e/nuzlockes/firered.json');

    const confirmButton = importDialog.getByRole('button', { name: 'Confirm' });
    await expect(confirmButton).toBeEnabled();
    await confirmButton.click();

    await expect(importDialog).toBeHidden();

    const downloadButton = page.getByTestId('download-image-button');
    await expect(downloadButton).toBeVisible();

    const downloadPromise = page.waitForEvent('download');
    await downloadButton.click();
    const download = await downloadPromise;

    const downloadDir = path.join(process.cwd(), 'e2e', 'screenshots');
    await fs.mkdir(downloadDir, { recursive: true });

    const downloadedImagePath = path.join(downloadDir, 'firered-download.png');
    await download.saveAs(downloadedImagePath);

    const [downloadedImage, expectedImage] = await Promise.all([
        fs.readFile(downloadedImagePath),
        fs.readFile(path.join(process.cwd(), 'e2e', 'nuzlockes', 'firered.png')),
    ]);

    expect(downloadedImage.equals(expectedImage)).toBe(true);
});


