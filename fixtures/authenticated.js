// @ts-check
import { test as base } from '@playwright/test';
import { completeOnboarding } from '../tests/ui/utils/authFlow.js';
import { CartPage } from '../Pages/CartPage.js';

/**
 * @typedef {Object} AuthenticatedTestFixtures
 * @property {{ page: import('@playwright/test').Page, mobileNumber: string }} authenticatedPage
 */

/**
 * @typedef {Object} AuthenticatedWorkerFixtures
 * @property {{
 *   storageState: Awaited<ReturnType<import('@playwright/test').BrowserContext['storageState']>>,
 *   mobileNumber: string,
 * }} workerStorageState
 */

/**
 * Extends the base test with:
 *  - `workerStorageState` (worker-scoped): runs completeOnboarding() through a
 *    real login + OTP round trip exactly once per Playwright worker, then
 *    captures the resulting cookies/localStorage (including the JWT) as a
 *    storageState snapshot.
 *  - `authenticatedPage` (test-scoped): opens a fresh context per test seeded
 *    with that snapshot, so every test still gets full isolation (its own
 *    context/page, closed after the test) without re-running onboarding.
 *
 * Deliberately worker-scoped rather than suite-scoped: completeOnboarding()
 * signs up a brand-new random user each time, and cart/checkout tests mutate
 * that user's real cart and stock on the backend. Sharing one seeded user
 * across all parallel tests would let them race on the same cart; scoping
 * the login to the worker keeps each worker's user isolated while still
 * only paying the login cost once per worker instead of once per test.
 *
 * A worker is also reused across multiple spec files (whenever there are
 * fewer workers than files), so the same worker-scoped user's cart can carry
 * items from one file into the next test that lands on that worker even
 * without any concurrency involved. authenticatedPage's teardown clears the
 * cart after every test to close that gap.
 *
 * The fixtures object below is cast to Fixtures<T, W, TestArgs, WorkerArgs>
 * (rather than casting `test`'s own type after the fact) because that's what
 * lets TS correctly infer extend()'s generic parameters from a concretely
 * typed argument. base.extend() is generic and, in a .js file, TS has no
 * generic call syntax (`extend<T, W>(...)`) to supply T/W directly — the only
 * remaining option is reverse-inferring them from the callback bodies, which
 * proved unreliable here, especially once authenticatedPage started reading
 * workerStorageState across the T/W boundary.
 */
export const test = base.extend(
  /** @type {import('@playwright/test').Fixtures<
   *   AuthenticatedTestFixtures,
   *   AuthenticatedWorkerFixtures,
   *   import('@playwright/test').PlaywrightTestArgs & import('@playwright/test').PlaywrightTestOptions,
   *   import('@playwright/test').PlaywrightWorkerArgs & import('@playwright/test').PlaywrightWorkerOptions
   * >} */
  ({
    workerStorageState: [
      async ({ browser }, use) => {
        const context = await browser.newContext();
        const page = await context.newPage();

        const { mobileNumber } = await completeOnboarding(page);
        const storageState = await context.storageState();

        await context.close();
        await use({ storageState, mobileNumber });
      },
      { scope: 'worker' },
    ],

    authenticatedPage: async ({ browser, workerStorageState }, use) => {
      const context = await browser.newContext({ storageState: workerStorageState.storageState });
      const page = await context.newPage();

      // The seeded localStorage only takes effect once the page navigates to
      // the matching origin, and specs expect to land already on /products
      // the way completeOnboarding used to leave them.
      await page.goto('http://localhost:5173/products');

      await use({ page, mobileNumber: workerStorageState.mobileNumber });

      // The worker's user (and its cart) is reused by whichever test/file
      // runs next on this worker, so leave the cart empty for it.
      await new CartPage(page).clearAll();
      await context.close();
    },
  })
);

export { expect } from '@playwright/test';
