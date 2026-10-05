import { test, expect } from "../../../fixtures/adminAuthenticated.js";
import { AdminProductsPage } from "../../../Pages/admin/AdminProductsPage.js";

test("admin can add a new product successfully", async ({ adminPage }) => {
  const { page } = adminPage;
  const productData = {
    name: "Crystal Hoop Earrings",
    sku: `EARR-HOO-${Date.now()}`,
    price: 1295,
    stock: 100,
    discount: 5,
    category: "Earrings",
    subcategory: "Studs",
    description: "Elegant crystal hoop earrings with a modern finish",
  };
  const adminProductsPage = new AdminProductsPage(page);
  await adminProductsPage.goto();
  await expect(adminProductsPage.productRows.first()).toBeVisible();
  const countBefore = await adminProductsPage.productRows.count();
  await adminProductsPage.clickAddProduct();
  await adminProductsPage.fillAndSubmit(productData);

  await expect(adminProductsPage.errorMessage).not.toBeVisible();
  await expect(page.getByText(productData.sku)).toBeVisible();

  const countAfter = await adminProductsPage.productRows.count();

  expect(countAfter).toBe(countBefore + 1);

  const apiResponse = await page.request.get(
    "http://localhost:5000/api/products",
  );
  const { products } = await apiResponse.json();
  const savedProduct = products.find((p) => p.sku === productData.sku);

  expect(savedProduct).toBeTruthy();
  expect(savedProduct.name).toBe(productData.name);
  expect(Number(savedProduct.price)).toBe(productData.price);
  expect(savedProduct.stock).toBe(productData.stock);
});
