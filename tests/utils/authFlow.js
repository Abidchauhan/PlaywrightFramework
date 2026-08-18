import { LoginPage } from '../../pages/LoginPage.js';
import { OtpVerifyPage } from '../../pages/OtpVerifyPage.js';

/**
 * Runs login + real-backend OTP verification and leaves the page on
 * /profile-setup. Shared by every spec whose flow starts with a fresh user.
 */
export async function loginWithOtp(page) {
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

  return { mobileNumber };
}
