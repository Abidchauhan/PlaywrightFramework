export class CheckoutPage {
  constructor(page) {
    this.page = page;
    this.total = page.getByTestId('checkout-total');
    this.placeOrderBtn = page.getByTestId('checkout-place-order-btn');
    this.errorMsg = page.getByTestId('checkout-error-msg');
    this.noAddressesMsg = page.getByTestId('checkout-no-addresses-msg');
    this.addAddressLink = page.getByTestId('checkout-add-address-link');
    this.manageAddressesLink = page.getByTestId('checkout-manage-addresses-link');
    // Per-address testid is dynamic (checkout-address-radio-{id}); matched by
    // prefix since the test doesn't need to know the address id up front.
    this.addressRadios = page.locator('[data-testid^="checkout-address-radio-"]');
  }

  async goto() {
    await this.page.goto('http://localhost:5173/checkout');
  }

  async getTotalAmount() {
    const raw = await this.total.textContent();
    return parseFloat(raw.replace(/[^0-9.]/g, ''));
  }

  async placeOrder() {
    await this.placeOrderBtn.click();
  }
}
