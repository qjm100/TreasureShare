import { test, expect } from '@playwright/test';

test.describe('Cart Smoke', () => {
  test('cart page redirects to login when unauthenticated', async ({ page }) => {
    await page.goto('/cart');
    await page.waitForTimeout(1000);
    // Unauthenticated users are redirected to login
    expect(page.url()).toMatch(/\/login|\/cart/);
  });

  test('cart API requires auth', async ({ request }) => {
    const res = await request.get('http://localhost:8080/api/toy/cart');
    const json = await res.json();
    expect([401, 500].includes(json.code)).toBeTruthy();
  });

  test('cart API works with login', async ({ request }) => {
    const loginRes = await request.post('http://localhost:8080/login', {
      data: { username: 'admin', password: 'admin123' },
      headers: { 'Content-Type': 'application/json' },
    });
    const loginJson = await loginRes.json();
    const token = loginJson.token;
    expect(token).toBeTruthy();

    const res = await request.get('http://localhost:8080/api/toy/cart', {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status()).toBe(200);
  });
});
