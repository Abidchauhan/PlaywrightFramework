import { chromium, expect } from "@playwright/test";
import { LoginPage } from "./Pages/LoginPage.js";
import { OtpVerifyPage } from "./Pages/OtpVerifyPage.js";
import { BASE_URL } from "./config/env.js";

export const ADMIN_STORAGE_STATE = "playwright/.auth/admin.json";

// Admin ek hi baar per run login karta hai, taaki parallel workers same mobile
// pe OTP overwrite na karein. Session file adminAuthenticated fixture use karta hai.
export default async function globalSetup() {
  const browser = await chromium.launch();
  // Apna browser hai, isliye config ka use.baseURL yahan nahi aata; tests wala
  // origin (BASE_URL) khud do, taaki saved session usi origin ke liye bane.
  const context = await browser.newContext({ baseURL: BASE_URL });
  const page = await context.newPage();

  const loginPage = new LoginPage(page);
  const otpVerifyPage = new OtpVerifyPage(page);
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
  await expect(page).toHaveURL(/\/admin/);

  await context.storageState({ path: ADMIN_STORAGE_STATE });
  await browser.close();
}
