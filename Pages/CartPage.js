import { expect } from '@playwright/test';

export class CartPage {
  constructor(page) {
    this.page = page;
    this.total = page.getByTestId('cart-total');
    this.checkoutLink = page.getByTestId('cart-checkout-link');
    this.emptyMsg = page.getByTestId('cart-empty-msg');
    // Per-product testid is dynamic (cart-item-remove-btn-{id}), so match on prefix.
    this.removeButtons = page.locator('[data-testid^="cart-item-remove-btn-"]');
  }

  async goto() {
    await this.page.goto('http://localhost:5173/cart');
  }

  qtyInput(productId) {
    return this.page.getByTestId(`cart-item-qty-input-${productId}`);
  }

  updateBtn(productId) {
    return this.page.getByTestId(`cart-item-update-btn-${productId}`);
  }

  removeBtn(productId) {
    return this.page.getByTestId(`cart-item-remove-btn-${productId}`);
  }

  errorMsg(productId) {
    return this.page.getByTestId(`cart-item-error-msg-${productId}`);
  }

  async updateQuantity(productId, quantity) {
    await this.qtyInput(productId).fill(String(quantity));
    await this.updateBtn(productId).click();
  }

  async getTotalAmount() {
    const totalRaw = await this.total.textContent();
    return parseFloat(totalRaw.replace(/[^0-9.]/g, ''));
  }

  /**
   * Removes every item from the cart, used to reset a worker-shared user's
   * cart between tests so leftover items from an earlier test/file don't
   * pollute a later test's total.
   */
  async clearAll() {
    await this.goto();

    let remaining = await this.removeButtons.count();
    while (remaining > 0) {
      await this.removeButtons.first().click();
      remaining -= 1;
      await expect(this.removeButtons).toHaveCount(remaining);
    }
  }
}
