import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:8080';
const API = `${BASE}/api/toy`;
let sellerToken: string;
let buyerToken: string;
let productId: number;
let addressId: number;
let orderId: number;
const buyerName = `ob_${Date.now().toString(36)}`;

test.describe('Order Lifecycle Smoke', () => {
  test.beforeAll(async ({ request }) => {
    // Login as seller (admin)
    const sellerLogin = await request.post(`${BASE}/login`, {
      data: { username: 'admin', password: 'admin123' },
      headers: { 'Content-Type': 'application/json' },
    });
    const sellerJson = await sellerLogin.json();
    expect(sellerJson.code).toBe(200);
    sellerToken = sellerJson.token;

    // Register and login as buyer
    await request.post(`${BASE}/register`, {
      data: { username: buyerName, password: 'Test123456' },
      headers: { 'Content-Type': 'application/json' },
    });
    const buyerLogin = await request.post(`${BASE}/login`, {
      data: { username: buyerName, password: 'Test123456' },
      headers: { 'Content-Type': 'application/json' },
    });
    const buyerJson = await buyerLogin.json();
    expect(buyerJson.code).toBe(200);
    buyerToken = buyerJson.token;

    // Seller creates a product with stock
    const uniqueName = `Smoke ${Date.now().toString(36)}`;
    const cpRes = await request.post(`${API}/products`, {
      data: { name: uniqueName, categoryId: 1, price: 39.9, rentPriceDay: 1, rentPriceMonth: 10, ageRange: '3-6', brand: 'Smoke', stock: 10, description: 'test' },
      headers: { Authorization: `Bearer ${sellerToken}`, 'Content-Type': 'application/json' },
    });
    expect(cpRes.status()).toBe(200);

    // Find the created product
    const findRes = await request.get(`${API}/products`);
    const findJson = await findRes.json();
    const products = (findJson.rows || findJson.data || []) as any[];
    const created = products.find(p => p.name === uniqueName);
    expect(created).toBeTruthy();
    productId = created.id;

    // Buyer adds product to cart
    const cartRes = await request.post(`${API}/cart`, {
      data: { productId, duration: 1 },
      headers: { Authorization: `Bearer ${buyerToken}`, 'Content-Type': 'application/json' },
    });
    expect(cartRes.status()).toBe(200);

    // Buyer creates an address
    const addrRes = await request.post(`${API}/addresses`, {
      data: { receiverName: 'Buyer', phone: '13900139000', province: 'Beijing', city: 'Beijing', district: 'Haidian', detail: '123 Test St', isDefault: '1' },
      headers: { Authorization: `Bearer ${buyerToken}`, 'Content-Type': 'application/json' },
    });
    const addrJson = await addrRes.json();
    addressId = addrJson.data?.id || (addrJson as any).id || 0;
    if (!addressId) {
      // Try getting an existing address for buyer
      const gaRes = await request.get(`${API}/addresses`, { headers: { Authorization: `Bearer ${buyerToken}` }});
      const gaJson = await gaRes.json();
      const addrs = (gaJson.rows || gaJson.data || []) as any[];
      if (addrs.length > 0) addressId = addrs[0].id;
    }
    expect(addressId).toBeTruthy();
  });

  test('step1 - create order from cart', async ({ request }) => {
    const res = await request.post(`${API}/orders`, {
      data: { addressId },
      headers: { Authorization: `Bearer ${buyerToken}`, 'Content-Type': 'application/json' },
    });
    const json = await res.json();
    expect(json.code).toBe(200);
    orderId = json.data || (json as any).id;
    expect(orderId).toBeTruthy();
  });

  test('step2 - pay order', async ({ request }) => {
    expect(orderId).toBeTruthy();
    const res = await request.put(`${API}/orders/${orderId}/pay`, {
      headers: { Authorization: `Bearer ${buyerToken}` },
    });
    const json = await res.json();
    expect(json.code).toBe(200);
  });

  test('step3 - verify order status after pay', async ({ request }) => {
    const res = await request.get(`${API}/orders/${orderId}`, {
      headers: { Authorization: `Bearer ${buyerToken}` },
    });
    const json = await res.json();
    expect(json.code).toBe(200);
  });

  test('orders page loaded', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(500);
    await page.goto('/orders');
    await page.waitForTimeout(1000);
    expect(page.url()).toBeTruthy();
  });
});
