// @ts-check
import { test, expect } from '../../fixtures/authenticated.js';
import * as allure from 'allure-js-commons';
import { ProductListingPage } from '../../Pages/ProductListingPage.js';
import { ProductDetailsPage } from '../../Pages/ProductDetailsPage.js';
import { CartPage } from '../../Pages/CartPage.js';
import { AddressesPage } from '../../Pages/AddressesPage.js';
import { CheckoutPage } from '../../Pages/CheckoutPage.js';

/**
 * Scenarios that mock a specific backend response with page.route() instead of
 * exercising the real backend, kept in their own file so it's obvious at a
 * glance that these tests prove "the UI handles response X correctly", not
 * "the whole system produces X" - a narrower guarantee than the rest of the
 * suite. Reserved for backend states the real system can't reliably or safely
 * produce on demand (a genuine 500, or two users racing for the last unit),
 * matching the same setup (real login, real product/cart/address data) as the
 * real-backend specs everywhere except the one call under test.
 */
test.describe('Mocked Scenarios', () => {
  test('shows an error and does not complete the order when checkout fails with a server error', async ({
    authenticatedPage,
  }) => {
    await allure.feature('Checkout');
    await allure.severity('normal');
    await allure.tags('mocked', 'error-handling');

    const { page } = authenticatedPage;
    const productListingPage = new ProductListingPage(page);
    const productDetailsPage = new ProductDetailsPage(page);
    const cartPage = new CartPage(page);
    const addressesPage = new AddressesPage(page);
    const checkoutPage = new CheckoutPage(page);

    await productListingPage.openRandomProduct();
    const productId = productDetailsPage.getProductIdFromUrl();
    expect(productId).toBeTruthy();

    await productDetailsPage.addToCart(1);
    await expect(productDetailsPage.successMsg).toBeVisible();

    await addressesPage.goto();
    await addressesPage.startAdd();
    await addressesPage.fillAndSubmit({
      label: 'Home',
      address: '221B Baker Street, Pune',
      country: 'India',
      state: 'Maharashtra',
      district: 'Pune',
    });

    await checkoutPage.goto();
    await expect(checkoutPage.addressRadios.first()).toBeChecked();

    // The real backend has no way to produce a 500 on demand, so this is
    // exactly the case page.route() exists for: a response the real system
    // can't reliably or safely be made to return for a test.
    await page.route('**/api/orders/checkout', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ success: false, message: 'Internal server error' }),
      });
    });

    await checkoutPage.placeOrder();

    await expect(checkoutPage.errorMsg).toBeVisible();
    await expect(page).not.toHaveURL(/\/order-confirmed\//);

    // A failed checkout must not have cleared the cart the way a successful
    // one would, even though it displayed an error - confirms the mock
    // actually intercepted the call rather than letting it through to a real
    // (and now inconsistent) result. Deliberately not asserting a stock
    // delta here: product stock is shared, globally-mutable state that other
    // real-checkout tests running in parallel can also touch, so an exact
    // before/after comparison would be racy against tests that have nothing
    // to do with this one - the cart check alone already proves the point.
    await cartPage.goto();
    await expect(cartPage.emptyMsg).not.toBeVisible();
  });

  test('shows an insufficient-stock error when the last unit sells out between page load and clicking Add to Cart', async ({
    authenticatedPage,
  }) => {
    await allure.feature('Cart');
    await allure.severity('normal');
    await allure.tags('mocked', 'error-handling');

    const { page } = authenticatedPage;
    const productListingPage = new ProductListingPage(page);
    const productDetailsPage = new ProductDetailsPage(page);

    await productListingPage.openRandomProduct();

    // Real page load: whatever stock the product actually has right now. The
    // mock below simulates that exact stock being bought out by someone else
    // in the moments between this load and the click - a real race that's
    // essentially unreproducible on demand against the live backend (it's the
    // same class of timing issue the product-stock race in checkout.spec.js
    // took real effort to even diagnose, let alone trigger deliberately).
    // Response shape confirmed for real first: POST /api/cart/add with a
    // quantity above stock actually returns this exact 400 + message.
    await page.route('**/api/cart/add', async (route) => {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          message: 'Insufficient stock. Only 0 available, you already have 0 in cart.',
        }),
      });
    });

    await productDetailsPage.addToCart(1);

    await expect(productDetailsPage.errorMsg).toBeVisible();
    await expect(productDetailsPage.errorMsg).toHaveText(
      'Insufficient stock. Only 0 available, you already have 0 in cart.'
    );
    await expect(productDetailsPage.successMsg).not.toBeVisible();
  });
});
