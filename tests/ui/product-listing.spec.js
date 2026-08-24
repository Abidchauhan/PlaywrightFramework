// @ts-check
import { test, expect } from '../../fixtures/authenticated.js';
import { ProductListingPage } from '../../Pages/ProductListingPage.js';

test.describe('Product Listing', () => {
  test('user can see product cards and open one after completing onboarding', async ({ authenticatedPage }) => {
    const { page } = authenticatedPage;
    const productListingPage = new ProductListingPage(page);

    await expect(page).toHaveURL(/\/products/);

    await expect(productListingPage.productCards.first()).toBeVisible();

    await productListingPage.openFirstProduct();

    await expect(page).toHaveURL(/\/products\/[^/]+$/);
  });
});
