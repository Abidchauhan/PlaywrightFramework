// @ts-check
import { test, expect } from '@playwright/test';
import * as allure from 'allure-js-commons';

const API_BASE_URL = 'http://localhost:5000/api';

test.describe('Products API', () => {
  test('GET /api/products returns 200 with a non-empty products array', async ({ request }) => {
    await allure.feature('ProductListing');
    await allure.severity('critical');
    await allure.tags('api', 'smoke');

    const response = await request.get(`${API_BASE_URL}/products`);

    expect(response.status()).toBe(200);

    const body = await response.json();

    expect(Array.isArray(body.products)).toBe(true);
    expect(body.products.length).toBeGreaterThan(0);
  });

  test('each product has id, name, price and stock', async ({ request }) => {
    await allure.feature('ProductListing');
    await allure.severity('normal');
    await allure.tag('api');

    const response = await request.get(`${API_BASE_URL}/products`);
    const { products } = await response.json();

    for (const product of products) {
      expect(typeof product.id).toBe('number');
      expect(typeof product.name).toBe('string');
      expect(product.name.length).toBeGreaterThan(0);
      // price comes back as a numeric string (e.g. "1999.00"), not a number
      expect(Number(product.price)).toBeGreaterThanOrEqual(0);
      expect(typeof product.stock).toBe('number');
      expect(product.stock).toBeGreaterThanOrEqual(0);
    }
  });
});
