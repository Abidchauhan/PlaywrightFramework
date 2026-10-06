import { test, expect } from "../../../fixtures/adminAuthenticated.js";
import * as allure from "allure-js-commons";
import { AdminProductsPage } from "../../../Pages/admin/AdminProductsPage.js";

function newProductData(label) {
  return {
    name: `Product for ${label} Test`,
    sku: `${label.toUpperCase()}-TEST-${Date.now()}`,
    price: 500,
    stock: 10,
    discount: 0,
    category: "Earrings",
    subcategory: "Studs",
    description: `Product for ${label} test`,
  };
}

test("admin can delete a product after confirming", async ({ adminPage }) => {
  await allure.feature("AdminProducts");
  await allure.severity("normal");
  await allure.tag("crud");

  const { page } = adminPage;
  const adminProductsPage = new AdminProductsPage(page);
  const productData = newProductData("delete");

  // Apna khud ka product banao
  await adminProductsPage.goto();
  await expect(adminProductsPage.productRows.first()).toBeVisible();
  await adminProductsPage.clickAddProduct();
  await adminProductsPage.fillAndSubmit(productData);

  const row = adminProductsPage.getRowBySku(productData.sku);
  await expect(row).toBeVisible();

  // Delete dabao aur modal mein confirm karo
  await adminProductsPage.clickDeleteForSku(productData.sku);
  await adminProductsPage.confirmDelete();

  // UI: modal band, aur wo row ab nahi hai
  await expect(adminProductsPage.deleteConfirmBtn).not.toBeVisible();
  await expect(row).toHaveCount(0);

  // Backend: product genuinely delete hua
  const apiResponse = await page.request.get(
    "http://localhost:5000/api/products",
  );
  const { products } = await apiResponse.json();
  expect(products.find((p) => p.sku === productData.sku)).toBeUndefined();
});

test("admin cancelling delete keeps the product", async ({ adminPage }) => {
  await allure.feature("AdminProducts");
  await allure.severity("minor");
  await allure.tag("crud");

  const { page } = adminPage;
  const adminProductsPage = new AdminProductsPage(page);
  const productData = newProductData("cancel");

  await adminProductsPage.goto();
  await expect(adminProductsPage.productRows.first()).toBeVisible();
  await adminProductsPage.clickAddProduct();
  await adminProductsPage.fillAndSubmit(productData);

  const row = adminProductsPage.getRowBySku(productData.sku);
  await expect(row).toBeVisible();

  // Delete dabao, par Cancel karo
  await adminProductsPage.clickDeleteForSku(productData.sku);
  await adminProductsPage.cancelDelete();

  // UI: modal band, row abhi bhi hai
  await expect(adminProductsPage.deleteCancelBtn).not.toBeVisible();
  await expect(row).toBeVisible();

  // Backend: product abhi bhi save hai
  const apiResponse = await page.request.get(
    "http://localhost:5000/api/products",
  );
  const { products } = await apiResponse.json();
  expect(products.find((p) => p.sku === productData.sku)).toBeTruthy();
});
