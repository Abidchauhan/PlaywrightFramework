// @ts-check
import { test, expect } from '@playwright/test';
import { ProductListingPage } from '../pages/ProductListingPage.js';
import { ProductDetailsPage } from '../pages/ProductDetailsPage.js';
import { CartPage } from '../pages/CartPage.js';
import { completeOnboarding } from './utils/authFlow.js';

test.describe('Cart', () => {
  test('adding a product to cart shows the correct quantity and total', async ({ page }) => {
    const productListingPage = new ProductListingPage(page);
    const productDetailsPage = new ProductDetailsPage(page);
    const cartPage = new CartPage(page);
    const quantity = 2;

    await completeOnboarding(page);
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
});
