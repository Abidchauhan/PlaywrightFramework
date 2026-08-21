// @ts-check
import { test as base } from '@playwright/test';
import { completeOnboarding } from '../tests/utils/authFlow.js';

/**
 * @typedef {Object} AuthenticatedFixtures
 * @property {{ page: import('@playwright/test').Page, mobileNumber: string }} authenticatedPage
 */

/**
 * Extends the base test with an `authenticatedPage` fixture that runs
 * completeOnboarding() once per test and hands back the onboarded page
 * plus the mobileNumber it was onboarded with, so specs that need backend
 * assertions tied to that user don't have to re-derive it.
 *
 * The explicit TestType<...> cast is required because base.extend() is
 * generic and, in a .js file, TS has no generic call syntax to pin down
 * the fixture type from the `use()` call alone — without this it silently
 * infers `test` as the unextended base test, so `authenticatedPage` looks
 * unknown to every spec that imports it.
 * @type {import('@playwright/test').TestType<
 *   import('@playwright/test').PlaywrightTestArgs & import('@playwright/test').PlaywrightTestOptions & AuthenticatedFixtures,
 *   import('@playwright/test').PlaywrightWorkerArgs & import('@playwright/test').PlaywrightWorkerOptions
 * >}
 */
export const test = base.extend({
  authenticatedPage: async ({ page }, use) => {
    const { mobileNumber } = await completeOnboarding(page);
    await use({ page, mobileNumber });
  },
});

export { expect } from '@playwright/test';
