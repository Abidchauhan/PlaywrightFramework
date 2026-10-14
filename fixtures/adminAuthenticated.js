import fs from "fs";
import { test as base } from "@playwright/test";
import { ADMIN_STORAGE_STATE } from "../global-setup.js";
import { API_URL, BASE_URL } from "../config/env.js";

// Reads the admin JWT from the saved session. Never log, print or attach it: the report is published.
function readAdminToken() {
  const state = JSON.parse(fs.readFileSync(ADMIN_STORAGE_STATE, "utf8"));
  const origin = state.origins.find((o) => o.origin === BASE_URL);
  const token = origin?.localStorage.find((item) => item.name === "token")?.value;
  if (!token) {
    throw new Error(`Cleanup: no admin token for ${BASE_URL} in the saved admin session`);
  }
  return token;
}

// Deletes exactly the product with this SKU, if it still exists. Never touches any other product.
async function deleteProductBySku(request, sku, testInfo) {
  const listResponse = await request.get(`${API_URL}/api/products`); // public, no token
  if (!listResponse.ok()) {
    throw new Error(`Cleanup: GET /api/products returned ${listResponse.status()}`);
  }
  const { products } = await listResponse.json();
  const product = products.find((p) => p.sku === sku); // exact SKU match only
  if (!product) return; // already gone, e.g. the test deleted it through the UI

  const token = readAdminToken();
  let status;
  try {
    const response = await request.delete(`${API_URL}/api/admin/products/${product.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    status = response.status();
  } catch {
    // Playwright's error call log lists every request header, including the token,
    // so the original error must never be rethrown or logged.
    throw new Error(`Cleanup: DELETE for product ${sku} failed before a response was received`);
  }

  if (status === 200 || status === 404) return;
  if (status === 409) {
    testInfo.annotations.push({
      type: "cleanup-skipped",
      description: `Product ${sku} is in a cart or order (409), so it was left in the database`,
    });
    return;
  }
  throw new Error(`Cleanup: DELETE for product ${sku} returned ${status}`);
}

// Admin session global-setup.js mein ek baar ban chuka hai; yahan sirf use karo.
export const test = base.extend({
  adminPage: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: ADMIN_STORAGE_STATE,
    });
    const page = await context.newPage();

    await use({ page });

    await context.close();
  },

  // Tests register each SKU they create; teardown deletes exactly those products,
  // even when the test failed.
  cleanupProductBySku: async ({ request }, use, testInfo) => {
    const skus = [];
    await use((sku) => skus.push(sku));
    for (const sku of skus) {
      await deleteProductBySku(request, sku, testInfo);
    }
  },
});

export { expect } from "@playwright/test";
