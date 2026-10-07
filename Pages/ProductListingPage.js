export class ProductListingPage {
  constructor(page) {
    this.page = page;
    // Per-product testid is dynamic (product-listing-card-link-{id}), so match on prefix.
    this.productCards = page.locator('[data-testid^="product-listing-card-link-"]');
    this.errorMsg = page.getByTestId('product-listing-error-msg');
  }

  async goto() {
    await this.page.goto('http://localhost:5173/products');
  }

  async openFirstProduct() {
    await this.productCards.first().click();
  }

  /**
   * Opens a random product rather than always the first one. The listing is
   * sorted by product name, so the first card is always the same product -
   * specs that check out (and then assert an exact stock delta) need to avoid
   * all converging on that one product across parallel runs.
   */
  async openRandomProduct() {
    const count = await this.productCards.count();
    const index = Math.floor(Math.random() * count);
    await this.productCards.nth(index).click();
  }
}
