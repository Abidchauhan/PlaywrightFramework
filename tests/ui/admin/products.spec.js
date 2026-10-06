import { test, expect } from "../../../fixtures/adminAuthenticated.js";
import * as allure from "allure-js-commons";
import { AdminProductsPage } from "../../../Pages/admin/AdminProductsPage.js";

test.describe("Admin Products", () => {
  test("admin can see product list with at least one product", async ({
    adminPage,
  }) => {
    await allure.feature("AdminProducts");
    await allure.severity("normal");
    await allure.tag("smoke");

    const { page } = adminPage;
    const adminProductsPage = new AdminProductsPage(page);
    await adminProductsPage.goto();
    await expect(adminProductsPage.productRows.first()).toBeVisible();
    const count = await adminProductsPage.productRows.count();
    expect(count).toBeGreaterThan(0);
  });
});
