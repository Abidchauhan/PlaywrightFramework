// @ts-check
import { test, expect } from '@playwright/test';
import { ProductListingPage } from '../Pages/ProductListingPage.js';
import { completeOnboarding } from './utils/authFlow.js';

test.describe('Product Listing', () => {
  test('user can see product cards and open one after completing onboarding', async ({ page }) => {
    const productListingPage = new ProductListingPage(page);

    await completeOnboarding(page);
    await expect(page).toHaveURL(/\/products/);

    await expect(productListingPage.productCards.first()).toBeVisible();

    await productListingPage.openFirstProduct();

    await expect(page).toHaveURL(/\/products\/[^/]+$/);
  });
});
