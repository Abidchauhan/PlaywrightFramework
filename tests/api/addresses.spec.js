// @ts-check
import { test, expect } from '@playwright/test';
import { getAuthToken } from './utils/authApi.js';

const API_BASE_URL = 'http://localhost:5000/api';

test.describe('Addresses API', () => {
  test('full CRUD cycle: create, read, update, delete', async ({ request }) => {
    const { token } = await getAuthToken(request);
    const authHeaders = { Authorization: `Bearer ${token}` };

    // Create
    const createResponse = await request.post(`${API_BASE_URL}/addresses`, {
      headers: authHeaders,
      data: {
        label: 'Home',
        address: '221B Baker Street, Pune',
        country_id: 1,
        state_id: 1,
        district_id: 1,
      },
    });

    expect(createResponse.status()).toBe(201);
    const { address: created } = await createResponse.json();
    expect(created).toMatchObject({ label: 'Home', address: '221B Baker Street, Pune' });

    // Read - verify it shows up in the list, not just in the create response
    const listAfterCreate = await request.get(`${API_BASE_URL}/addresses`, { headers: authHeaders });
    const { addresses: addressesAfterCreate } = await listAfterCreate.json();
    expect(addressesAfterCreate.some((a) => a.id === created.id)).toBe(true);

    // Update
    const updateResponse = await request.put(`${API_BASE_URL}/addresses/${created.id}`, {
      headers: authHeaders,
      data: {
        // label is a constrained enum on this API (Home/Office/Other), not free text
        label: 'Office',
        address: '42 Updated Street, Pune',
        country_id: 1,
        state_id: 1,
        district_id: 1,
      },
    });

    expect(updateResponse.status()).toBe(200);

    // Verify the update persisted by reading it back, same reason the create
    // step re-reads via GET rather than trusting the write response alone.
    const listAfterUpdate = await request.get(`${API_BASE_URL}/addresses`, { headers: authHeaders });
    const { addresses: addressesAfterUpdate } = await listAfterUpdate.json();
    const updated = addressesAfterUpdate.find((a) => a.id === created.id);
    expect(updated).toMatchObject({ label: 'Office', address: '42 Updated Street, Pune' });

    // Delete
    const deleteResponse = await request.delete(`${API_BASE_URL}/addresses/${created.id}`, {
      headers: authHeaders,
    });

    expect(deleteResponse.status()).toBe(200);

    const listAfterDelete = await request.get(`${API_BASE_URL}/addresses`, { headers: authHeaders });
    const { addresses: addressesAfterDelete } = await listAfterDelete.json();
    expect(addressesAfterDelete.some((a) => a.id === created.id)).toBe(false);
  });

  test('GET /api/addresses without a token returns 401', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/addresses`);

    expect(response.status()).toBe(401);
  });
});
