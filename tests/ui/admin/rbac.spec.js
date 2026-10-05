import { test, expect } from "../../../fixtures/adminAuthenticated.js";
import { completeOnboarding } from "../utils/authFlow.js";

test.describe("Admin RBAC", () => {
  test("unauthenticated user visiting /admin is redirected to /login", async ({
    page,
  }) => {
    await page.goto("http://localhost:5173/admin");
    await expect(page).toHaveURL(/\/login/);
  });

  test("normal user visiting /admin is redirected to /products", async ({
    page,
  }) => {
    await completeOnboarding(page);
    await page.goto("http://localhost:5173/admin");
    await expect(page).toHaveURL(/\/products/);
  });
  test("admin user logging in is redirected to /admin dashboard", async ({
    adminPage,
  }) => {
    const { page } = adminPage;
    await page.goto("http://localhost:5173/admin");
    await expect(page).toHaveURL(/\/admin/);
  });
});
