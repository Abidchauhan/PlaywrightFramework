// @ts-check
import { test, expect } from '@playwright/test';
import { getAuthToken } from './utils/authApi.js';
import { completeCheckout } from './utils/checkoutApi.js';

const API_BASE_URL = 'http://localhost:5000/api';

test.describe('Orders API', () => {
  test('GET /api/orders lists the order with correct fields', async ({ request }) => {
    const { token } = await getAuthToken(request);
    const authHeaders = { Authorization: `Bearer ${token}` };
    const { orderNumber, totalAmount } = await completeCheckout(request, token);

    const listResponse = await request.get(`${API_BASE_URL}/orders`, { headers: authHeaders });
    expect(listResponse.status()).toBe(200);

    const { orders } = await listResponse.json();
    const order = orders.find((o) => o.order_number === orderNumber);

    expect(order).toBeTruthy();
    // total_amount comes back as a numeric string in the list endpoint,
    // unlike the number checkout's own response returns it as.
    expect(Number(order.total_amount)).toBeCloseTo(totalAmount, 2);
    expect(order.status).toBe('placed');
  });

  test('GET /api/orders/:id returns full order details', async ({ request }) => {
    const { token } = await getAuthToken(request);
    const authHeaders = { Authorization: `Bearer ${token}` };
    const { orderNumber, productId, quantity } = await completeCheckout(request, token);

    const listResponse = await request.get(`${API_BASE_URL}/orders`, { headers: authHeaders });
    const { orders } = await listResponse.json();
    const orderId = orders.find((o) => o.order_number === orderNumber).id;

    const detailResponse = await request.get(`${API_BASE_URL}/orders/${orderId}`, { headers: authHeaders });
    expect(detailResponse.status()).toBe(200);

    const { order } = await detailResponse.json();
    expect(order.order_number).toBe(orderNumber);
    expect(order.items).toHaveLength(1);
    expect(order.items[0]).toMatchObject({ product_id: productId, quantity });
  });

  test('a different user gets 404 (not 403) when requesting another user’s order by id', async ({ request }) => {
    const { token: ownerToken } = await getAuthToken(request);
    const { orderNumber } = await completeCheckout(request, ownerToken);

    const listResponse = await request.get(`${API_BASE_URL}/orders`, {
      headers: { Authorization: `Bearer ${ownerToken}` },
    });
    const { orders } = await listResponse.json();
    const orderId = orders.find((o) => o.order_number === orderNumber).id;

    const { token: otherUserToken } = await getAuthToken(request);
    const response = await request.get(`${API_BASE_URL}/orders/${orderId}`, {
      headers: { Authorization: `Bearer ${otherUserToken}` },
    });

    // 404, not 403: the API doesn't reveal that an order id exists at all
    // to a user who doesn't own it, rather than confirming its existence
    // via a "forbidden" response.
    expect(response.status()).toBe(404);
  });
});
