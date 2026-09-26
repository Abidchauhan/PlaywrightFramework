import { test, expect } from "@playwright/test";
import { LoginPage } from "../../../Pages/LoginPage.js";
import { OtpVerifyPage } from "../../../Pages/OtpVerifyPage.js";
import { AdminProductsPage } from "../../../Pages/admin/AdminProductsPage.js";

test("admin can add a new product successfully", async ({ page }) => {
  const productData = {
    name: "Crystal Hoop Earrings",
    sku: `EARR-HOO-${Date.now()}`,
    price: 1295,
    stock: 100,
    discount: 5,
    category: "Earrings",
    subcategory: "Hoop",
    description: "Elegant crystal hoop earrings with a modern finish",
  };
  const loginPage = new LoginPage(page);
  const otpVerifyPage = new OtpVerifyPage(page);
  const adminProductsPage = new AdminProductsPage(page);
  const mobileNumber = "9123456780";
  await loginPage.goto();
  const [sendOtpResponse] = await Promise.all([
    page.waitForResponse(
      (response) =>
        response.url().includes("/auth/send-otp") &&
        response.request().method() === "POST",
    ),
    loginPage.login(mobileNumber),
  ]);
  const { otp } = await sendOtpResponse.json();
  await otpVerifyPage.verify(otp);
  await adminProductsPage.goto();
  await expect(adminProductsPage.productRows.first()).toBeVisible();
  const countBefore = await adminProductsPage.productRows.count();
  await adminProductsPage.clickAddProduct();
  await adminProductsPage.fillAndSubmit(productData);

  await expect(adminProductsPage.errorMessage).not.toBeVisible();
  await expect(page.getByText(productData.sku)).toBeVisible();

  const countAfter = await adminProductsPage.productRows.count();

  expect(countAfter).toBe(countBefore + 1);

  console.log(productData.name);
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
