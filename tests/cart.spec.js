// @ts-check
import { test, expect } from '../fixtures/authenticated.js';
import { ProductListingPage } from '../Pages/ProductListingPage.js';
import { ProductDetailsPage } from '../pages/ProductDetailsPage.js';
import { CartPage } from '../Pages/CartPage.js';

test.describe('Cart', () => {
  test('adding a product to cart shows the correct quantity and total', async ({ authenticatedPage }) => {
    const { page } = authenticatedPage;
    const productListingPage = new ProductListingPage(page);
    const productDetailsPage = new ProductDetailsPage(page);
    const cartPage = new CartPage(page);
    const quantity = 2;

    await productListingPage.openFirstProduct();

    const productId = productDetailsPage.getProductIdFromUrl();
    expect(productId).toBeTruthy();

    // Read price + discount before adding to cart so the expected total is
    // computed independently of whatever the cart page ends up rendering.
    const unitPrice = await productDetailsPage.getEffectiveUnitPrice();

    await productDetailsPage.addToCart(quantity);
    await expect(productDetailsPage.successMsg).toBeVisible();

    await cartPage.goto();

    await expect(cartPage.qtyInput(productId)).toHaveValue(String(quantity));

    const actualTotal = await cartPage.getTotalAmount();
    expect(actualTotal).toBeCloseTo(unitPrice * quantity, 2);
  });

  test('updating cart quantity above available stock shows an error and does not change the quantity', async ({
    authenticatedPage,
  }) => {
    const { page } = authenticatedPage;
    const productListingPage = new ProductListingPage(page);
    const productDetailsPage = new ProductDetailsPage(page);
    const cartPage = new CartPage(page);
    const validQuantity = 1;

    await productListingPage.openFirstProduct();

    const productId = productDetailsPage.getProductIdFromUrl();
    expect(productId).toBeTruthy();

    // Read real stock from the backend rather than guessing a "big enough"
    // number, so the over-stock quantity is always guaranteed to exceed it.
    const stock = await productDetailsPage.getStock(productId);
    expect(stock).toBeGreaterThan(0);
    const invalidQuantity = stock + 1000;

    await productDetailsPage.addToCart(validQuantity);
    await expect(productDetailsPage.successMsg).toBeVisible();

    await cartPage.goto();
    await expect(cartPage.qtyInput(productId)).toHaveValue(String(validQuantity));

    await cartPage.updateQuantity(productId, invalidQuantity);
    await expect(cartPage.errorMsg(productId)).toBeVisible();

    // The rejected update leaves the typed value sitting in the input until
    // the next fetch, so reload to confirm the persisted quantity is unchanged.
    await cartPage.goto();
    await expect(cartPage.qtyInput(productId)).toHaveValue(String(validQuantity));
  });
});
