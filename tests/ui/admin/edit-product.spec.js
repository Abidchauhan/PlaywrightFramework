import { test, expect } from "../../../fixtures/adminAuthenticated.js";
import { AdminProductsPage } from "../../../Pages/admin/AdminProductsPage.js";

test("admin can edit an existing product", async ({ adminPage }) => {
  const { page } = adminPage;
  const adminProductsPage = new AdminProductsPage(page);

  // Apna khud ka product banao
  const productData = {
    name: "Product for Price Edit Test",
    sku: `PRICE-EDIT-${Date.now()}`,
    price: 500,
    stock: 10,
    discount: 0,
    category: "Earrings",
    subcategory: "Hoop",
    description: "Product for price edit test",
  };

  await adminProductsPage.goto();
  await expect(adminProductsPage.productRows.first()).toBeVisible();
  await adminProductsPage.clickAddProduct();
  await adminProductsPage.fillAndSubmit(productData);
  await expect(page.getByText(productData.sku)).toBeVisible();

  // Isi specific product ko edit karo
  await adminProductsPage.clickEditForSku(productData.sku);
  const newPrice = 1500;
  await adminProductsPage.inputPrice.fill(String(newPrice));
  await adminProductsPage.submitButton.click();

  // Sirf apni row ke andar naya price check karo
  const row = adminProductsPage.getRowBySku(productData.sku);
  // Exact "₹1500.00": substring "1500" SKU timestamp mein bhi aa sakta hai
  await expect(
    row.getByText(`₹${newPrice.toFixed(2)}`, { exact: true }),
  ).toBeVisible();
});

test("admin can add previously empty field when editing", async ({
  adminPage,
}) => {
  const { page } = adminPage;
  const adminProductsPage = new AdminProductsPage(page);

  const productData = {
    name: "Test Product for Edit",
    sku: `EDIT-TEST-${Date.now()}`,
    price: 500,
    stock: 10,
    discount: 0,
    category: "Earrings",
    subcategory: "Hoop",
    description: "Product for edit test",
  };

  await adminProductsPage.goto();
  await expect(adminProductsPage.productRows.first()).toBeVisible();
  await adminProductsPage.clickAddProduct();
  await adminProductsPage.fillAndSubmit(productData);
  await expect(page.getByText(productData.sku)).toBeVisible();

  await adminProductsPage.clickEditForSku(productData.sku);
  await adminProductsPage.productBrand.fill("Beauty plus");
  await adminProductsPage.productMaterial.fill("Silver");
  await adminProductsPage.productColor.fill("black");
  await adminProductsPage.submitButton.click();

  // Modal band hone ka wait: iska matlab save poora ho chuka hai
  await expect(page.getByTestId("admin-modal")).not.toBeVisible();

  // Brand UI table mein nahi dikhta, isliye API se verify karo
  const apiResponse = await page.request.get(
    "http://localhost:5000/api/products",
  );
  const { products } = await apiResponse.json();
  const editedProduct = products.find((p) => p.sku === productData.sku);
  expect(editedProduct).toBeTruthy();
  expect(editedProduct.brand).toBe("Beauty plus");
  expect(editedProduct.material).toBe("Silver");
  expect(editedProduct.color).toBe("black");
});
