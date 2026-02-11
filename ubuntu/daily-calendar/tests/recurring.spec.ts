
import { test, expect } from '@playwright/test';

test.describe('Recurring Tasks', () => {
    const BASE_URL = 'http://localhost:5173';

    test.beforeEach(async ({ page }) => {
        await page.goto(BASE_URL);
        await expect(page.getByText('今天')).toBeVisible();
    });

    test('should create, edit (single), and delete (future) a recurring task', async ({ page }) => {
        // 1. Create recurring task
        await page.getByTitle('新建任务').click();
        await expect(page.getByText('新建任务')).toBeVisible();

        const taskTitle = `Recurring Task ${Date.now()}`;
        await page.getByPlaceholder('输入任务名称...').fill(taskTitle);

        // Select Repeat: Daily
        await page.locator('select').nth(3).selectOption('daily');
        await page.getByText('创建').click();

        // Verify creation
        await expect(page.locator('.task-block', { hasText: taskTitle }).first()).toBeVisible();

        // 2. Verify multiple instances exist (at least 2)
        const taskInstances = page.locator('.task-block', { hasText: taskTitle });
        const count = await taskInstances.count();
        expect(count).toBeGreaterThan(1);

        // 3. Edit single instance (Tomorrow's instance, index 1)
        await taskInstances.nth(1).click();
        await expect(page.getByText('编辑任务')).toBeVisible();

        const newTitle = `${taskTitle} (Edited) - Unique`;
        await page.getByPlaceholder('输入任务名称...').fill(newTitle);
        await page.getByText('保存').click();

        // Confirm "Only This"
        await expect(page.getByText('修改重复日程')).toBeVisible();
        await page.getByText('仅修改此日程').click();

        // Verify:
        // First instance (Today) retains old title
        const firstInstanceText = await taskInstances.nth(0).innerText();
        expect(firstInstanceText).toContain(taskTitle);

        // Second instance (Tomorrow) has new title
        await expect(page.locator('.task-block', { hasText: newTitle })).toBeVisible();

        // 4. Delete "This and Future"
        // Click First instance (Today)
        await taskInstances.nth(0).click();
        await page.getByText('删除').click();

        // Confirm "This and Future"
        await expect(page.getByText('删除重复日程')).toBeVisible();
        await page.getByText('删除此日程及之后所有').click();

        // Verify: All original recurring tasks are gone
        // Only the "Unique" one should remain
        // Note: The "Unique" task title contains the original taskTitle string, so we check count is 1.
        const finalCount = await taskInstances.count();
        expect(finalCount).toBe(1);
        await expect(taskInstances.first()).toContainText('Unique');
    });
});
