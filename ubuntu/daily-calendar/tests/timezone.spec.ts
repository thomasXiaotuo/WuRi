
import { test, expect } from '@playwright/test';

test.describe('Timezone Support', () => {
    const BASE_URL = 'http://localhost:5173';

    test.beforeEach(async ({ page }) => {
        await page.goto(BASE_URL);
        await expect(page.getByText('今天')).toBeVisible();
    });

    test('should shift recurring task time when switching timezones', async ({ page }) => {
        // 1. Create a task in "Asia/Tokyo" (GMT+9)

        // Switch to "Asia/Tokyo" first using the global selector
        // The global selector has class 'timezone-select'
        await page.locator('select.timezone-select').selectOption('Asia/Tokyo');

        // Open Modal
        await page.getByTitle('新建任务').click();

        // Fill details: Daily Task at 09:00 AM
        const taskTitle = `Tokyo Morning Meeting ${Date.now()}`;
        await page.getByPlaceholder('输入任务名称...').fill(taskTitle);

        // Set Time: 09:00
        // Inputs in modal have class 'modal-select'.
        // Order: 0:Date, 1:Time, 2:Duration
        await page.locator('.modal-select').nth(1).selectOption('09:00');

        // Duration default 60 (1 hour) is fine.

        // Set Repeat: Daily
        // Repeat select is visible (if !task), it is the 4th select (index 3)
        // Order: 0:Date, 1:Time, 2:Duration, 3:Repeat
        await page.locator('.modal-select').nth(3).selectOption('daily');

        // Verify Timezone selector appears (Index 4)
        // Order: 0:Date, 1:Time, 2:Duration, 3:Repeat, 4:Timezone
        const timezoneSelect = page.locator('.modal-select').nth(4);
        await expect(timezoneSelect).toBeVisible();
        await expect(timezoneSelect).toHaveValue('Asia/Tokyo');

        await page.getByText('创建').click();

        // Verify in Tokyo View: Should be 09:00
        const taskInTokyo = page.locator('.task-block', { hasText: taskTitle }).first();
        await expect(taskInTokyo).toBeVisible();
        await expect(taskInTokyo).toContainText('09:00');

        // 2. Switch to "America/New_York" (GMT-4 or -5)
        // Tokyo 09:00 is NY 20:00 (Previous Day) roughly (13h diff)
        await page.locator('select.timezone-select').selectOption('America/New_York');

        const taskInNY = page.locator('.task-block', { hasText: taskTitle }).first();
        await expect(taskInNY).toBeVisible();

        // Verify time is 20:00 (8:00 PM)
        await expect(taskInNY).toContainText('20:00');
    });
});
