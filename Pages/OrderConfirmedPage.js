export class OrderConfirmedPage {
  constructor(page) {
    this.page = page;
    this.orderId = page.getByTestId('order-confirmed-id');
    this.total = page.getByTestId('order-confirmed-total');
    this.continueLink = page.getByTestId('order-confirmed-continue-link');
  }

  async getOrderId() {
    const text = await this.orderId.textContent();
    return text.trim();
  }

  async getTotalAmount() {
    const raw = await this.total.textContent();
    return parseFloat(raw.replace(/[^0-9.]/g, ''));
  }
}
