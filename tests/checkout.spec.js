// @ts-check
import { test, expect } from '@playwright/test';
import { ProductListingPage } from '../pages/ProductListingPage.js';
import { ProductDetailsPage } from '../pages/ProductDetailsPage.js';
import { CartPage } from '../pages/CartPage.js';
import { AddressesPage } from '../pages/AddressesPage.js';
import { CheckoutPage } from '../pages/CheckoutPage.js';
import { OrderConfirmedPage } from '../pages/OrderConfirmedPage.js';
import { completeOnboarding } from './utils/authFlow.js';

test.describe('Checkout', () => {
  test('placing an order from cart navigates to order confirmation with the matching total', async ({ page }) => {
    const productListingPage = new ProductListingPage(page);
    const productDetailsPage = new ProductDetailsPage(page);
    const cartPage = new CartPage(page);
    const addressesPage = new AddressesPage(page);
    const checkoutPage = new CheckoutPage(page);
    const orderConfirmedPage = new OrderConfirmedPage(page);
    const quantity = 1;

    await completeOnboarding(page);
    await productListingPage.openFirstProduct();

    const productId = productDetailsPage.getProductIdFromUrl();
    expect(productId).toBeTruthy();

    const stockBefore = await productDetailsPage.getStock(productId);

    const unitPrice = await productDetailsPage.getEffectiveUnitPrice();
    await productDetailsPage.addToCart(quantity);
    await expect(productDetailsPage.successMsg).toBeVisible();

    // Checkout requires a saved delivery address, which is a separate feature
    // from the address collected during onboarding's personal-details step.
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

    const expectedTotal = await checkoutPage.getTotalAmount();
    expect(expectedTotal).toBeCloseTo(unitPrice * quantity, 2);

    await checkoutPage.placeOrder();
    await page.waitForURL(/\/order-confirmed\//);

    const orderId = await orderConfirmedPage.getOrderId();
    expect(orderId).toMatch(/^ORD-\d{8}-\d+$/);

    const confirmedTotal = await orderConfirmedPage.getTotalAmount();
    expect(confirmedTotal).toBeCloseTo(expectedTotal, 2);

    // Order placement is one atomic transaction (stock decrements, order is
    // created, cart is cleared), so confirm all three sides landed together,
    // not just the redirect to confirmation.
    const stockAfter = await productDetailsPage.getStock(productId);
    expect(stockAfter).toBe(stockBefore - quantity);

    await cartPage.goto();
    await expect(cartPage.emptyMsg).toBeVisible();
  });
});
