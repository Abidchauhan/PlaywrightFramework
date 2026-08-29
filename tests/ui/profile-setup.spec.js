// @ts-check
import { test, expect } from '@playwright/test';
import * as allure from 'allure-js-commons';
import { ProfileSetupPage } from '../../Pages/ProfileSetupPage.js';
import { loginWithOtp } from './utils/authFlow.js';

test.describe('Profile Setup', () => {
  test('user can cascade through country, state, district and reach personal details', async ({ page }) => {
    await allure.feature('ProfileSetup');
    await allure.severity('blocker');
    await allure.tag('smoke');

    const profileSetupPage = new ProfileSetupPage(page);

    await loginWithOtp(page);
    await expect(page).toHaveURL(/\/profile-setup/);

    await profileSetupPage.selectCountry('India');
    await profileSetupPage.selectState('Maharashtra');
    await profileSetupPage.selectDistrict('Pune');

    await profileSetupPage.submit();

    await expect(page).toHaveURL(/\/personal-details/);
  });
});
