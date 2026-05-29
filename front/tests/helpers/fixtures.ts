import { login, register, createProduct, addToCart, createAddress, createOrder, getCart } from './api';

export interface SeedData {
  username: string;
  token: string;
  productIds: number[];
  orderId: number;
  addressId: number;
}

export async function seed(): Promise<SeedData> {
  const username = `smoke_${Date.now()}`;

  // Register
  const reg = await register(username);
  if (reg.code !== 200) throw new Error(`Register failed: ${reg.msg}`);

  // Login
  const auth = await login(username);
  if (auth.code !== 200) throw new Error(`Login failed: ${auth.msg}`);

  // Create products
  const p1 = await createProduct({ name: 'Smoke Test 绘本', categoryId: 1, price: 29.9, rentPriceDay: 1, rentPriceMonth: 9.9, ageRange: '3-6', brand: 'Test', stock: 5, description: 'Smoke test book' });
  const p2 = await createProduct({ name: 'Smoke Test 玩具', categoryId: 2, price: 89, rentPriceDay: 3, rentPriceMonth: 29, ageRange: '2-5', brand: 'Test', stock: 3, description: 'Smoke test toy' });
  const productIds = [p1.data?.id || (p1 as any).id, p2.data?.id || (p2 as any).id].filter(Boolean);

  // Add to cart
  if (productIds[0]) await addToCart(productIds[0], 2);

  // Create address
  const addr = await createAddress({ receiverName: 'Smoke Test', phone: '13800138000', province: 'Beijing', city: 'Beijing', district: 'Chaoyang', detail: '123 Test St', isDefault: '1' });
  const addressId = addr.data?.id || (addr as any).id || 0;

  return { username, token: '', productIds, orderId: 0, addressId };
}

// Create seed data once before tests
export let seedData: SeedData | null = null;

export async function getSeedData(): Promise<SeedData> {
  if (!seedData) seedData = await seed();
  return seedData;
}
