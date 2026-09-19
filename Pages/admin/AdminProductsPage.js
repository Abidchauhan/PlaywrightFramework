export class AdminProductsPage {
  constructor(page) {
    this.page = page;
    this.addProductBtn = page.getByTestId("admin-add-product-btn");
    this.productRows = page.locator('[data-testid^="admin-product-row-"]');
    this.productEdit = page.locator('[data-testid^="admin-product-edit-btn-"]');
    this.productDelete = page.locator('[data-testid^="admin-product-delete-btn-"]');
  }

  async goto() {
    await this.page.goto("http://localhost:5173/admin/products");
  }
}
