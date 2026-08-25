// @ts-check

const API_BASE_URL = 'http://localhost:5000/api';

/**
 * Adds a product to the authenticated user's cart, saves a delivery address,
 * and completes checkout - the same three-step flow checkout.spec.js drives
 * directly (since checkout is what that spec tests). For specs where a
 * completed order is just a precondition, not the thing under test.
 * @param {import('@playwright/test').APIRequestContext} request
 * @param {string} token
 */
export async function completeCheckout(request, token) {
  const authHeaders = { Authorization: `Bearer ${token}` };

  const productsResponse = await request.get(`${API_BASE_URL}/products`);
  const { products } = await productsResponse.json();
  // Picked at random rather than products[0]: checking out bumps a product's
  // updated_at, which resorts it back to the front of this list - so always
  // taking products[0] makes every parallel checkout converge on the same
  // product and race on its stock count.
  const productId = products[Math.floor(Math.random() * products.length)].id;
  const quantity = 1;

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
  const { address } = await addressResponse.json();

  const checkoutResponse = await request.post(`${API_BASE_URL}/orders/checkout`, {
    headers: authHeaders,
    data: { address_id: address.id },
  });
  const { order } = await checkoutResponse.json();

  return {
    productId,
    quantity,
    orderNumber: order.order_number,
    totalAmount: order.total_amount,
  };
}
