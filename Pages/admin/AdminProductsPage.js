import { expect } from "@playwright/test";
export class AdminProductsPage {
  constructor(page) {
    this.page = page;
    this.addProductBtn = page.getByTestId("admin-add-product-btn");
    this.productRows = page.locator('[data-testid^="admin-product-row-"]');
    this.productEdit = page.locator('[data-testid^="admin-product-edit-btn-"]');
    this.productDelete = page.locator(
      '[data-testid^="admin-product-delete-btn-"]',
    );
    this.inputName = page.getByTestId("admin-product-form-name");
    this.inputSKU = page.getByTestId("admin-product-form-sku");
    this.inputPrice = page.getByTestId("admin-product-form-price");
    this.inputDiscount = page.getByTestId("admin-product-form-discount");
    this.inputStock = page.getByTestId("admin-product-form-stock");
    this.selectCategory = page.getByTestId("admin-product-form-category");
    this.selectSubCategory = page.getByTestId("admin-product-form-subcategory");
    this.productDescription = page.getByTestId(
      "admin-product-form-description",
    );
    this.submitButton = page.getByTestId("admin-product-form-submit");
    this.errorMessage = page.getByTestId("admin-product-form-error");
    this.adminModal = page.getByTestId("admin-modal");
  }

  async goto() {
    await this.page.goto("http://localhost:5173/admin/products");
  }

  async clickAddProduct() {
    await this.addProductBtn.click();
  }

  async fillAndSubmit(productData) {
    await this.inputName.fill(productData.name);
    await this.inputSKU.fill(productData.sku);
    await this.inputPrice.fill(String(productData.price));
    await this.inputStock.fill(String(productData.stock));
    await this.inputDiscount.fill(String(productData.discount));

    // Category select karne pe Subcategory API call trigger hoti hai
    await Promise.all([
      this.page.waitForResponse(
        (response) =>
          response.url().includes("/api/products/subcategories") &&
          response.request().method() === "GET",
      ),
      this.selectCategory.selectOption({ label: productData.category }),
    ]);

    // Ab Subcategory select karo
    await this.selectSubCategory.selectOption({
      label: productData.subcategory,
    });

    await this.productDescription.fill(String(productData.description));
    await this.submitButton.click();
  }
}
