// @ts-check
import { test, expect } from '@playwright/test';
import * as allure from 'allure-js-commons';
import { getAuthToken } from './utils/authApi.js';

const API_BASE_URL = 'http://localhost:5000/api';

test.describe('Checkout API', () => {
  test('placing an order decrements stock, creates the order, and empties the cart', async ({ request }) => {
    await allure.feature('Checkout');
    await allure.severity('blocker');
    await allure.tags('api', 'smoke');

    const { token } = await getAuthToken(request);
    const authHeaders = { Authorization: `Bearer ${token}` };
    const quantity = 1;

    const productsResponse = await request.get(`${API_BASE_URL}/products`);
    const { products } = await productsResponse.json();
    // Picked at random rather than products[0]: checking out bumps a product's
    // updated_at, which resorts it back to the front of this list - so always
    // taking products[0] makes every parallel checkout converge on the same
    // product and race on its stock count.
    const productId = products[Math.floor(Math.random() * products.length)].id;

    const productBeforeResponse = await request.get(`${API_BASE_URL}/products/${productId}`);
    const { product: productBefore } = await productBeforeResponse.json();
    const stockBefore = productBefore.stock;

    // price/discount come back as numeric strings, and checkout's total is
    // price * (1 - discount%) * quantity - same math the UI checkout test
    // verifies independently before trusting the page's displayed total.
    const unitPrice = Number(productBefore.price) * (1 - Number(productBefore.discount) / 100);
    const expectedTotal = unitPrice * quantity;

    await request.post(`${API_BASE_URL}/cart/add`, {
      headers: authHeaders,
      data: { product_id: productId, quantity },
    });

    const addressResponse = await request.post(`${API_BASE_URL}/addresses`, {
      headers: authHeaders,
      data: {
        label: 'Home',
        address: '221B Baker Street, Pune',
        country_id: 1,
        state_id: 1,
        district_id: 1,
      },
    });
    expect(addressResponse.status()).toBe(201);
    const { address } = await addressResponse.json();

    const checkoutResponse = await request.post(`${API_BASE_URL}/orders/checkout`, {
      headers: authHeaders,
      data: { address_id: address.id },
    });

    expect(checkoutResponse.status()).toBe(201);
    const { order } = await checkoutResponse.json();

    expect(order.order_number).toMatch(/^ORD-\d{8}-\d+$/);
    expect(order.total_amount).toBeCloseTo(expectedTotal, 2);

    // Order placement is one atomic transaction (stock decrements, order is
    // created, cart is cleared), same three sides the UI checkout test
    // verifies after the redirect to order-confirmed.
    const productAfterResponse = await request.get(`${API_BASE_URL}/products/${productId}`);
    const { product: productAfter } = await productAfterResponse.json();
    expect(productAfter.stock).toBe(stockBefore - quantity);

    const cartResponse = await request.get(`${API_BASE_URL}/cart`, { headers: authHeaders });
    const { items } = await cartResponse.json();
    expect(items).toEqual([]);
  });
});
