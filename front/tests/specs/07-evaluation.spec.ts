import { test, expect } from '@playwright/test';

test.describe('Evaluation Smoke', () => {
  test('evaluation API returns product evaluations', async ({ request }) => {
    const res = await request.get('http://localhost:8080/api/toy/evaluations/1');
    expect(res.status()).toBe(200);
    const json = await res.json();
    expect(json.code).toBe(200);
  });
});
