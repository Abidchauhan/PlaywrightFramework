// @ts-check
import { test, expect } from '@playwright/test';

const API_BASE_URL = 'http://localhost:5000/api';

test.describe('Auth API', () => {
  test('send-otp then verify-otp succeeds for a fresh mobile number', async ({ request }) => {
    // Random valid mobile number so this run always hits a brand-new user,
    // same reason the UI flows do it in tests/ui/utils/authFlow.js.
    const mobile = '9' + Math.floor(100000000 + Math.random() * 900000000).toString();

    const sendOtpResponse = await request.post(`${API_BASE_URL}/auth/send-otp`, {
      data: { mobile },
    });

    expect(sendOtpResponse.status()).toBe(200);

    const { otp } = await sendOtpResponse.json();
    expect(otp).toBeTruthy();

    const verifyOtpResponse = await request.post(`${API_BASE_URL}/auth/verify-otp`, {
      data: { mobile, otp },
    });

    expect(verifyOtpResponse.status()).toBe(200);

    const verifyBody = await verifyOtpResponse.json();
    expect(verifyBody.token).toBeTruthy();
    expect(verifyBody.user).toMatchObject({ mobile });
  });

  test('send-otp rejects an invalid mobile number', async ({ request }) => {
    const response = await request.post(`${API_BASE_URL}/auth/send-otp`, {
      data: { mobile: '123' },
    });

    expect(response.status()).toBe(400);
  });
});
