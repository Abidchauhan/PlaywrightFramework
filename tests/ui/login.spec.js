// @ts-check
import { test, expect } from '@playwright/test';
import * as allure from 'allure-js-commons';
import { LoginPage } from '../../Pages/LoginPage.js';
import { OtpVerifyPage } from '../../Pages/OtpVerifyPage.js';

test.describe('Login Page', () => {
  test('user can navigate to login page and see the mobile input field', async ({ page }) => {
    await allure.feature('Login');
    await allure.severity('normal');
    await allure.tag('smoke');

    const loginPage = new LoginPage(page);

    await loginPage.goto();

    await expect(loginPage.mobileInput).toBeVisible();
  });

  const invalidMobileCases = [
    { reason: 'too short', mobile: '123' },
    { reason: 'too long', mobile: '12345678901' },
    { reason: 'non-numeric', mobile: 'abcdefghij' },
    { reason: 'empty', mobile: '' },
  ];

  for (const { reason, mobile } of invalidMobileCases) {
    test(`shows validation error for an invalid mobile number - ${reason} and stays on the login page`, async ({
      page,
    }) => {
      await allure.feature('Login');
      await allure.severity('minor');
      await allure.tag('validation');

      const loginPage = new LoginPage(page);

      await loginPage.goto();
      await loginPage.login(mobile);

      await expect(loginPage.errorMsg).toBeVisible();
      await expect(loginPage.errorMsg).toHaveText('Enter a valid 10-digit mobile number');
      await expect(page).toHaveURL(/.*login/);
    });
  }

  test('user can complete login and verify OTP with the real backend OTP', async ({ page }) => {
    await allure.feature('Login');
    await allure.severity('blocker');
    await allure.tag('smoke');

    const loginPage = new LoginPage(page);
    const otpVerifyPage = new OtpVerifyPage(page);

    // Random valid mobile number so this run always hits a brand-new user
    const mobileNumber = '9' + Math.floor(100000000 + Math.random() * 900000000).toString();

    await loginPage.goto();

    const [sendOtpResponse] = await Promise.all([
      page.waitForResponse(
        (response) => response.url().includes('/auth/send-otp') && response.request().method() === 'POST'
      ),
      loginPage.login(mobileNumber),
    ]);

    const { otp } = await sendOtpResponse.json();

    await otpVerifyPage.verify(otp);

    // New user, no profile yet -> app routes to profile setup
    await expect(page).toHaveURL(/\/profile-setup/);
  });
});
