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
}
