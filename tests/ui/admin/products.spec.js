import { test, expect } from "@playwright/test";
import { LoginPage } from "../../../Pages/LoginPage.js";
import { OtpVerifyPage } from "../../../Pages/OtpVerifyPage.js";
import { AdminProductsPage } from "../../../Pages/admin/AdminProductsPage.js";

test.describe("Admin Products", () => {
  test("admin can see product list with at least one product", async ({
    page,
  }) => {
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
    const count = await adminProductsPage.productRows.count();
    expect(count).toBeGreaterThan(0);
  });
});
