export class ProductDetailsPage {
  constructor(page) {
    this.page = page;
    this.quantityInput = page.getByTestId('product-details-quantity-input');
    this.addToCartBtn = page.getByTestId('product-details-addtocart-btn');
    this.errorMsg = page.getByTestId('product-details-error-msg');
    this.successMsg = page.getByTestId('product-details-success-msg');
    this.priceText = page.getByTestId('product-detail-price');
    this.discountText = page.getByTestId('product-detail-discount');
  }

  getProductIdFromUrl() {
    const match = this.page.url().match(/\/products\/([^/?#]+)/);
    return match ? match[1] : null;
  }

  /**
   * Stock isn't exposed via testid (only as "In Stock (n)" body text), so read
   * it straight from the backend to avoid parsing display text.
   */
  async getStock(productId) {
    const response = await this.page.request.get(`http://localhost:5000/api/products/${productId}`);
    const { product } = await response.json();
    return product.stock;
  }

  async addToCart(quantity) {
    await this.quantityInput.fill(String(quantity));
    await this.addToCartBtn.click();
  }

  /**
   * The cart's per-unit line-item price still shows the pre-discount price,
   * but cart-total is computed off price * (1 - discount%). Both figures are
   * only visible here on the product page, so callers read this before
   * adding to cart to independently verify the cart's total math.
   */
  async getEffectiveUnitPrice() {
    const priceRaw = await this.priceText.textContent();
    const price = parseFloat(priceRaw.replace(/[^0-9.]/g, ''));

    let discountPercent = 0;
    if (await this.discountText.count()) {
      const discountRaw = await this.discountText.textContent();
      const match = discountRaw.match(/([\d.]+)\s*%/);
      if (match) discountPercent = parseFloat(match[1]);
    }

    return price * (1 - discountPercent / 100);
  }
}
