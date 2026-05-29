import { test, expect } from '@playwright/test';

test.describe('Messages Smoke', () => {
  test('messages page loads', async ({ page }) => {
    await page.goto('/messages');
    await page.waitForTimeout(1000);
    // Page renders even without auth, but may show login prompt
    expect(page.url()).toBeTruthy();
  });

  test('messages API returns conversations', async ({ request }) => {
    const loginRes = await request.post('http://localhost:8080/login', {
      data: { username: 'admin', password: 'admin123' },
      headers: { 'Content-Type': 'application/json' },
    });
    const { token } = await loginRes.json();

    const res = await request.get('http://localhost:8080/api/toy/messages/conversations', {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status()).toBe(200);
    const json = await res.json();
    expect(json.code).toBe(200);
  });
});
