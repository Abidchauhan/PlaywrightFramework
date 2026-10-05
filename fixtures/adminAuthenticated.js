import { test as base } from "@playwright/test";
import { ADMIN_STORAGE_STATE } from "../global-setup.js";

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
});

export { expect } from "@playwright/test";
