// @ts-check
import { test, expect } from '@playwright/test';
import { ProfileSetupPage } from '../../Pages/ProfileSetupPage.js';
import { PersonalDetailsPage } from '../../Pages/PersonalDetailsPage.js';
import { loginWithOtp } from './utils/authFlow.js';

test.describe('Personal Details', () => {
  test('user can fill personal details after profile setup and reach products', async ({ page }) => {
    const profileSetupPage = new ProfileSetupPage(page);
    const personalDetailsPage = new PersonalDetailsPage(page);

    await loginWithOtp(page);
    await expect(page).toHaveURL(/\/profile-setup/);

    await profileSetupPage.selectCountry('India');
    await profileSetupPage.selectState('Maharashtra');
    await profileSetupPage.selectDistrict('Pune');
    await profileSetupPage.submit();

    await expect(page).toHaveURL(/\/personal-details/);

    await personalDetailsPage.fillAndSubmit('Test User', 'Male', '28', '123 MG Road, Pune');

    await expect(page).toHaveURL(/\/products/);
  });
});
