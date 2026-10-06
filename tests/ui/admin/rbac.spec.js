import { test, expect } from "../../../fixtures/adminAuthenticated.js";
import * as allure from "allure-js-commons";
import { completeOnboarding } from "../utils/authFlow.js";

test.describe("Admin RBAC", () => {
  test("unauthenticated user visiting /admin is redirected to /login", async ({
    page,
  }) => {
    await allure.feature("AdminRBAC");
    await allure.severity("critical");
    await allure.tag("security");

    await page.goto("http://localhost:5173/admin");
    await expect(page).toHaveURL(/\/login/);
  });

  test("normal user visiting /admin is redirected to /products", async ({
    page,
  }) => {
    await allure.feature("AdminRBAC");
    await allure.severity("critical");
    await allure.tag("security");

    await completeOnboarding(page);
    await page.goto("http://localhost:5173/admin");
    await expect(page).toHaveURL(/\/products/);
  });
  test("admin session can open /admin dashboard", async ({ adminPage }) => {
    await allure.feature("AdminRBAC");
    await allure.severity("blocker");
    await allure.tag("smoke");

    const { page } = adminPage;
    await page.goto("http://localhost:5173/admin");
    await expect(page).toHaveURL(/\/admin/);
  });
});
