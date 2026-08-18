// @ts-check
import { test, expect } from '@playwright/test';
import { LoginPage } from '../Pages/LoginPage.js';
import { OtpVerifyPage } from '../Pages/OtpVerifyPage.js';
import { ProfileSetupPage } from '../Pages/ProfileSetupPage.js';

test.describe('Profile Setup', () => {
  test('user can cascade through country, state, district and reach personal details', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const otpVerifyPage = new OtpVerifyPage(page);
    const profileSetupPage = new ProfileSetupPage(page);

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
    await expect(page).toHaveURL(/\/profile-setup/);

    // TODO: replace with real seeded option labels for this environment
    await profileSetupPage.selectCountry('India');
    await profileSetupPage.selectState('Maharashtra');
    await profileSetupPage.selectDistrict('Pune');

    await profileSetupPage.submit();

    await expect(page).toHaveURL(/\/personal-details/);
  });
});
