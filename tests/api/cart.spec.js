// @ts-check
import { test, expect } from '@playwright/test';
import * as allure from 'allure-js-commons';
import { getAuthToken } from './utils/authApi.js';

const API_BASE_URL = 'http://localhost:5000/api';

/**
 * @typedef {Object} CartItem
 * @property {number} product_id
 * @property {number} quantity
 * @property {string} name
 * @property {string} price
 * @property {string} discount
 * @property {string} image
 * @property {number} stock
 */

test.describe('Cart API', () => {
  test('adding a product to the cart is reflected in GET /api/cart', async ({ request }) => {
    await allure.feature('Cart');
    await allure.severity('critical');
    await allure.tags('api', 'smoke');

    const { token } = await getAuthToken(request);

    const productsResponse = await request.get(`${API_BASE_URL}/products`);
    const { products } = await productsResponse.json();
    const product = products[0];
    const quantity = 2;

    const addResponse = await request.post(`${API_BASE_URL}/cart/add`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { product_id: product.id, quantity },
    });

    expect(addResponse.status()).toBe(200);
    const addBody = await addResponse.json();
    expect(addBody.success).toBe(true);

    const cartResponse = await request.get(`${API_BASE_URL}/cart`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(cartResponse.status()).toBe(200);
    const { items } = /** @type {{ items: CartItem[] }} */ (await cartResponse.json());

    const cartItem = items.find((item) => item.product_id === product.id);
    expect(cartItem).toBeTruthy();
    expect(cartItem?.quantity).toBe(quantity);
  });

  test('GET /api/cart without a token returns 401', async ({ request }) => {
    await allure.feature('Cart');
    await allure.severity('critical');
    await allure.tags('api', 'security');

    const response = await request.get(`${API_BASE_URL}/cart`);

    expect(response.status()).toBe(401);
  });
});
