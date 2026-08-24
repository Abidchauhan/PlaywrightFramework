// @ts-check
import { test, expect } from '@playwright/test';
import { getAuthToken } from './utils/authApi.js';

const API_BASE_URL = 'http://localhost:5000/api';

test.describe('Wishlist API', () => {
  test('add, list, and remove a product', async ({ request }) => {
    const { token } = await getAuthToken(request);
    const authHeaders = { Authorization: `Bearer ${token}` };

    const productsResponse = await request.get(`${API_BASE_URL}/products`);
    const { products } = await productsResponse.json();
    const productId = products[0].id;

    const addResponse = await request.post(`${API_BASE_URL}/wishlist`, {
      headers: authHeaders,
      data: { product_id: productId },
    });

    expect(addResponse.status()).toBe(200);

    const listAfterAdd = await request.get(`${API_BASE_URL}/wishlist`, { headers: authHeaders });
    const { items: itemsAfterAdd } = await listAfterAdd.json();
    expect(itemsAfterAdd.some((item) => item.product_id === productId)).toBe(true);

    const deleteResponse = await request.delete(`${API_BASE_URL}/wishlist/${productId}`, {
      headers: authHeaders,
    });

    expect(deleteResponse.status()).toBe(200);

    const listAfterDelete = await request.get(`${API_BASE_URL}/wishlist`, { headers: authHeaders });
    const { items: itemsAfterDelete } = await listAfterDelete.json();
    expect(itemsAfterDelete.some((item) => item.product_id === productId)).toBe(false);
  });

  test('adding the same product twice does not create a duplicate entry', async ({ request }) => {
    const { token } = await getAuthToken(request);
    const authHeaders = { Authorization: `Bearer ${token}` };

    const productsResponse = await request.get(`${API_BASE_URL}/products`);
    const { products } = await productsResponse.json();
    const productId = products[0].id;

    const firstAdd = await request.post(`${API_BASE_URL}/wishlist`, {
      headers: authHeaders,
      data: { product_id: productId },
    });
    const secondAdd = await request.post(`${API_BASE_URL}/wishlist`, {
      headers: authHeaders,
      data: { product_id: productId },
    });

    // Backend uses INSERT IGNORE on the duplicate, so the repeat add still
    // returns 200 rather than a 409/400 - the assertion that actually matters
    // is that the list only ever has one entry for this product.
    expect(firstAdd.status()).toBe(200);
    expect(secondAdd.status()).toBe(200);

    const listResponse = await request.get(`${API_BASE_URL}/wishlist`, { headers: authHeaders });
    const { items } = await listResponse.json();
    const matches = items.filter((item) => item.product_id === productId);

    expect(matches).toHaveLength(1);
  });

  test('GET /api/wishlist without a token returns 401', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/wishlist`);

    expect(response.status()).toBe(401);
  });
});
