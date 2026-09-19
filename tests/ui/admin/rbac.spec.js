import { test,expect } from '@playwright/test';
import { LoginPage } from '../../../Pages/LoginPage.js';
import { completeOnboarding } from '../utils/authFlow.js';
import { OtpVerifyPage } from '../../../Pages/OtpVerifyPage.js';

test.describe('Admin RBAC', () => {
  test('unauthenticated user visiting /admin is redirected to /login', async ({ page }) => {
    await page.goto('http://localhost:5173/admin');
    await expect(page).toHaveURL(/\/login/);
  });

  test('normal user visiting /admin is redirected to /products', async ({ page }) => {
    await completeOnboarding(page);
    await page.goto('http://localhost:5173/admin');
    await expect(page).toHaveURL(/\/products/);
  });
  test('admin user logging in is redirected to /admin dashboard', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const otpVerifyPage = new OtpVerifyPage(page);
  const mobileNumber = '9123456780';
  
  await loginPage.goto();
   const [sendOtpResponse] = await Promise.all([
      page.waitForResponse(
        (response) => response.url().includes('/auth/send-otp') && response.request().method() === 'POST'
      ),
      loginPage.login(mobileNumber),
    ]);
    const { otp } = await sendOtpResponse.json();

    await otpVerifyPage.verify(otp);
    await expect(page).toHaveURL(/\/admin/);
  
   });
});