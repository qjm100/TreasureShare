const BASE = 'http://localhost:8080';
const API = `${BASE}/api/toy`;

let cachedToken: string | null = null;

async function request(path: string, options: RequestInit = {}) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  if (cachedToken) headers['Authorization'] = `Bearer ${cachedToken}`;
  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  const json = await res.json();
  if (json.code !== 200) throw new Error(`API error: ${json.msg}`);
  return json;
}

export async function login(username = 'testuser', password = 'Test123456') {
  const res = await fetch(`${BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  const json = await res.json();
  if (json.code === 200 && json.token) cachedToken = json.token;
  return json;
}

export async function register(username: string, password = 'Test123456') {
  return request('/register', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

export async function createProduct(data: Record<string, unknown>) {
  return request('/api/toy/products', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getProducts(params = '') {
  return request(`/api/toy/products${params ? `?${params}` : ''}`);
}

export async function getProduct(id: number) {
  return request(`/api/toy/products/${id}`);
}

export async function addToCart(productId: number, duration = 1) {
  return request('/api/toy/cart', {
    method: 'POST',
    body: JSON.stringify({ productId, duration }),
  });
}

export async function getCart() {
  return request('/api/toy/cart');
}

export async function getAddresses() {
  return request('/api/toy/addresses');
}

export async function createAddress(data: Record<string, unknown>) {
  return request('/api/toy/addresses', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function createOrder(addressId: number) {
  return request('/api/toy/orders', {
    method: 'POST',
    body: JSON.stringify({ addressId }),
  });
}

export async function getOrders(params = '') {
  return request(`/api/toy/orders${params ? `?${params}` : ''}`);
}

export async function getOrder(id: number) {
  return request(`/api/toy/orders/${id}`);
}

export async function orderAction(id: number, action: 'pay' | 'receive' | 'return' | 'confirmReturn' | 'disinfect' | 'renew' | 'cancel') {
  return request(`/api/toy/orders/${id}/${action}`, { method: 'PUT' });
}

export async function getCommunityPosts() {
  return request('/api/toy/community/posts');
}

export async function getEvaluations(productId: number) {
  return request(`/api/toy/evaluations/${productId}`);
}

export async function getMessages() {
  return request('/api/toy/messages/conversations');
}

export async function getCategories() {
  return request('/api/toy/categories/tree');
}

export function getToken() { return cachedToken; }
