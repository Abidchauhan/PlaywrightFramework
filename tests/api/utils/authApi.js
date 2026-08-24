// @ts-check

const API_BASE_URL = 'http://localhost:5000/api';

/**
 * Runs send-otp + verify-otp against the real backend for a fresh random
 * mobile number and returns the resulting auth token. For API specs that need
 * to call a protected endpoint and treat login as a setup step, not the thing
 * under test — auth.spec.js still calls send-otp/verify-otp directly since
 * those endpoints are what it's actually testing.
 * @param {import('@playwright/test').APIRequestContext} request
 */
export async function getAuthToken(request) {
  const mobile = '9' + Math.floor(100000000 + Math.random() * 900000000).toString();

  const sendOtpResponse = await request.post(`${API_BASE_URL}/auth/send-otp`, {
    data: { mobile },
  });
  const { otp } = await sendOtpResponse.json();

  const verifyOtpResponse = await request.post(`${API_BASE_URL}/auth/verify-otp`, {
    data: { mobile, otp },
  });
  const { token } = await verifyOtpResponse.json();

  return { token, mobile };
}
