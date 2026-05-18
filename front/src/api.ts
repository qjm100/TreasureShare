const BASE = '/api/toy';

async function request(url: string, options: RequestInit = {}): Promise<any> {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? {'Authorization': `Bearer ${token}`} : {}),
    ...(options.headers as Record<string, string> || {}),
  };
  const res = await fetch(url, {...options, headers});
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  if (json.code !== 200) throw new Error(json.msg || 'Error');
  return json;
}

export const api = {
  // Auth
  login: (username: string, password: string) =>
    request('/login', {method: 'POST', body: JSON.stringify({username, password})}),
  register: (username: string, password: string) =>
    request('/register', {method: 'POST', body: JSON.stringify({username, password})}),

  // Products
  getProducts: (params: Record<string, string> = {}) =>
    request(`${BASE}/products?${new URLSearchParams(params)}`),
  getProduct: (id: number) => request(`${BASE}/products/${id}`),
  getMyProducts: () => request(`${BASE}/products/my`),
  createProduct: (data: any) => request(`${BASE}/products`, {method: 'POST', body: JSON.stringify(data)}),
  updateProduct: (id: number, data: any) =>
    request(`${BASE}/products/${id}`, {method: 'PUT', body: JSON.stringify(data)}),
  deleteProduct: (id: number) => request(`${BASE}/products/${id}`, {method: 'DELETE'}),

  // Categories
  getCategories: () => request(`${BASE}/categories/tree`),

  // Cart
  getCart: () => request(`${BASE}/cart`),
  addToCart: (productId: number, duration: number) =>
    request(`${BASE}/cart`, {method: 'POST', body: JSON.stringify({productId, duration})}),
  updateCart: (id: number, duration: number) =>
    request(`${BASE}/cart/${id}`, {method: 'PUT', body: JSON.stringify({duration})}),
  removeFromCart: (id: number) => request(`${BASE}/cart/${id}`, {method: 'DELETE'}),

  // Orders
  getOrders: () => request(`${BASE}/orders`),
  getOrder: (id: number) => request(`${BASE}/orders/${id}`),
  createOrder: (addressId: number) =>
    request(`${BASE}/orders`, {method: 'POST', body: JSON.stringify({addressId})}),
  payOrder: (id: number) => request(`${BASE}/orders/${id}/pay`, {method: 'PUT'}),
  receiveOrder: (id: number) => request(`${BASE}/orders/${id}/receive`, {method: 'PUT'}),
  returnOrder: (id: number, returnLogisticsNo: string) =>
    request(`${BASE}/orders/${id}/return`, {method: 'PUT', body: JSON.stringify({returnLogisticsNo})}),
  getSellerOrders: () => request(`${BASE}/orders/seller`),
  shipOrder: (id: number, logisticsNo: string) =>
    request(`${BASE}/orders/${id}/ship`, {method: 'PUT', body: JSON.stringify({logisticsNo})}),
  confirmReturnOrder: (id: number) => request(`${BASE}/orders/${id}/confirm-return`, {method: 'PUT'}),
  disinfectOrder: (id: number) => request(`${BASE}/orders/${id}/disinfect`, {method: 'PUT'}),
  renewOrder: (id: number) => request(`${BASE}/orders/${id}/renew`, {method: 'PUT'}),
  cancelOrder: (id: number) => request(`${BASE}/orders/${id}/cancel`, {method: 'PUT'}),

  // Addresses
  getAddresses: () => request(`${BASE}/addresses`),
  addAddress: (data: any) => request(`${BASE}/addresses`, {method: 'POST', body: JSON.stringify(data)}),
  updateAddress: (id: number, data: any) =>
    request(`${BASE}/addresses/${id}`, {method: 'PUT', body: JSON.stringify(data)}),
  deleteAddress: (id: number) => request(`${BASE}/addresses/${id}`, {method: 'DELETE'}),

  // User
  getProfile: () => request(`${BASE}/user/profile`),
  updateProfile: (data: any) =>
    request(`${BASE}/user/profile`, {method: 'PUT', body: JSON.stringify(data)}),

  // Evaluations
  getEvaluations: (productId: number) => request(`${BASE}/evaluations/${productId}`),
  addEvaluation: (data: any) =>
    request(`${BASE}/evaluations`, {method: 'POST', body: JSON.stringify(data)}),

  // Upload
  upload: async (file: File): Promise<string> => {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${BASE}/upload`, {
      method: 'POST',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      body: formData,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (json.code !== 200) throw new Error(json.msg || 'Upload failed');
    const raw = json.data.url || json.data;
    // Normalize double slashes in path (keep :// in protocol)
    return raw.replace(/([^:])\/+/g, '$1/');
  },

  // Messages
  getConversations: () => request(`${BASE}/messages/conversations`),
  getMessages: (peerId: number) => request(`${BASE}/messages/${peerId}`),
  sendMessage: (receiverId: number, content: string) =>
    request(`${BASE}/messages`, {method: 'POST', body: JSON.stringify({receiverId, content})}),
  searchUsers: (username: string) => request(`${BASE}/user/search?username=${encodeURIComponent(username)}`),

  // Community
  getPosts: () => request(`${BASE}/community/posts`),
  getPost: (id: number) => request(`${BASE}/community/posts/${id}`),
  createPost: (data: any) =>
    request(`${BASE}/community/posts`, {method: 'POST', body: JSON.stringify(data)}),
  deletePost: (id: number) => request(`${BASE}/community/posts/${id}`, {method: 'DELETE'}),
  getComments: (postId: number) => request(`${BASE}/community/comments/${postId}`),
  addComment: (data: any) =>
    request(`${BASE}/community/comment`, {method: 'POST', body: JSON.stringify(data)}),
  likePost: (postId: number) =>
    request(`${BASE}/community/like/${postId}`, {method: 'POST'}),
};
