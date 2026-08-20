export class CartPage {
  constructor(page) {
    this.page = page;
    this.total = page.getByTestId('cart-total');
    this.checkoutLink = page.getByTestId('cart-checkout-link');
    this.emptyMsg = page.getByTestId('cart-empty-msg');
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
}
