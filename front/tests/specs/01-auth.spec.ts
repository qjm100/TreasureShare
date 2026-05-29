import { test, expect } from '@playwright/test';

test.describe('Auth Smoke', () => {
  test('login page loads via SPA navigation', async ({ page }) => {
    // Navigate to root first to load SPA, then navigate to login
    await page.goto('/');
    await page.waitForTimeout(1000);
    await page.goto('/login');
    await page.waitForTimeout(500);
    const inputs = page.getByPlaceholder(/用户名|username|admin/i);
    await expect(inputs.first()).toBeVisible({ timeout: 5000 });
  });

  test('login with valid credentials', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1000);
    await page.goto('/login');
    await page.getByPlaceholder(/用户名|username/i).fill('admin');
    await page.getByPlaceholder(/密码|password/i).fill('admin123');
    await page.getByRole('button', { name: '登录' }).last().click();
    await page.waitForTimeout(1500);
    // After login, should redirect away from login page
    expect(page.url()).not.toContain('/login');
  });

  test('register API returns ok', async ({ request }) => {
    const res = await request.post('http://localhost:8080/register', {
      data: { username: `sr_${Date.now().toString(36)}`, password: 'Test123456' },
      headers: { 'Content-Type': 'application/json' },
    });
    const json = await res.json();
    expect(json.code).toBe(200);
  });
});
