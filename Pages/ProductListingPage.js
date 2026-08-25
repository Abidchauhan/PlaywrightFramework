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
   * Opens a random product rather than always the first one. Checking out
   * bumps a product's updated_at, which resorts it back to the front of this
   * list - so specs that check out (and then assert an exact stock delta)
   * need to avoid always converging on the same product across parallel runs.
   */
  async openRandomProduct() {
    const count = await this.productCards.count();
    const index = Math.floor(Math.random() * count);
    await this.productCards.nth(index).click();
  }
}
