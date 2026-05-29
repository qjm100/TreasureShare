import { test, expect } from '@playwright/test';

test.describe('Community Smoke', () => {
  test('community page loads', async ({ page }) => {
    await page.goto('/community');
    await page.waitForTimeout(1000);
    expect(page.url()).toBeTruthy();
  });

  test('community API returns posts', async ({ request }) => {
    const res = await request.get('http://localhost:8080/api/toy/community/posts');
    expect(res.status()).toBe(200);
    const json = await res.json();
    expect(json.code).toBe(200);
  });
});
