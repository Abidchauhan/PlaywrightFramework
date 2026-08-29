// @ts-check
import { test, expect } from '@playwright/test';
import * as allure from 'allure-js-commons';
import { getAuthToken } from './utils/authApi.js';

const API_BASE_URL = 'http://localhost:5000/api';

/**
 * @typedef {Object} Address
 * @property {number} id
 * @property {number} user_id
 * @property {string} label
 * @property {string} address
 * @property {number} country_id
 * @property {number} state_id
 * @property {number} district_id
 * @property {number} is_default
 * @property {string} created_at
 * @property {string} updated_at
 * @property {string} country_name
 * @property {string} state_name
 * @property {string} district_name
 */

test.describe('Addresses API', () => {
  test('full CRUD cycle: create, read, update, delete', async ({ request }) => {
    await allure.feature('Addresses');
    await allure.severity('normal');
    await allure.tags('api', 'smoke');

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
    const { address: created } = /** @type {{ address: Address }} */ (await createResponse.json());
    expect(created).toMatchObject({ label: 'Home', address: '221B Baker Street, Pune' });

    // Read - verify it shows up in the list, not just in the create response
    const listAfterCreate = await request.get(`${API_BASE_URL}/addresses`, { headers: authHeaders });
    const { addresses: addressesAfterCreate } = /** @type {{ addresses: Address[] }} */ (
      await listAfterCreate.json()
    );
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
    const { addresses: addressesAfterUpdate } = /** @type {{ addresses: Address[] }} */ (
      await listAfterUpdate.json()
    );
    const updated = addressesAfterUpdate.find((a) => a.id === created.id);
    expect(updated).toMatchObject({ label: 'Office', address: '42 Updated Street, Pune' });

    // Delete
    const deleteResponse = await request.delete(`${API_BASE_URL}/addresses/${created.id}`, {
      headers: authHeaders,
    });

    expect(deleteResponse.status()).toBe(200);

    const listAfterDelete = await request.get(`${API_BASE_URL}/addresses`, { headers: authHeaders });
    const { addresses: addressesAfterDelete } = /** @type {{ addresses: Address[] }} */ (
      await listAfterDelete.json()
    );
    expect(addressesAfterDelete.some((a) => a.id === created.id)).toBe(false);
  });

  test('GET /api/addresses without a token returns 401', async ({ request }) => {
    await allure.feature('Addresses');
    await allure.severity('critical');
    await allure.tags('api', 'security');

    const response = await request.get(`${API_BASE_URL}/addresses`);

    expect(response.status()).toBe(401);
  });
});
