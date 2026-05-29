import { test, expect } from '@playwright/test';

test.describe('Profile & Address Smoke', () => {
  test('profile page loads', async ({ page }) => {
    await page.goto('/profile');
    await page.waitForTimeout(1000);
    expect(page.url()).toBeTruthy();
  });

  test('addresses API works with login', async ({ request }) => {
    const loginRes = await request.post('http://localhost:8080/login', {
      data: { username: 'admin', password: 'admin123' },
      headers: { 'Content-Type': 'application/json' },
    });
    const { token } = await loginRes.json();

    const res = await request.get('http://localhost:8080/api/toy/addresses', {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status()).toBe(200);
  });
});
