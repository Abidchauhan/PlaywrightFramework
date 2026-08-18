import { expect } from '@playwright/test';

export class ProfileSetupPage {
  constructor(page) {
    this.page = page;
    this.countrySelect = page.getByTestId('profile-setup-country-select');
    this.stateSelect = page.getByTestId('profile-setup-state-select');
    this.districtSelect = page.getByTestId('profile-setup-district-select');
    this.submitBtn = page.getByTestId('profile-setup-submit-btn');
    this.errorMsg = page.getByTestId('profile-setup-error-msg');
  }

  /**
   * Selects a country and waits for the /locations/states response that
   * repopulates the state dropdown, since selectOption() only resolves once
   * the DOM value has changed, not once the follow-up API call has landed.
   */
  async selectCountry(countryLabel) {
    await Promise.all([
      this.page.waitForResponse(
        (response) => response.url().includes('/api/locations/states') && response.request().method() === 'GET'
      ),
      this.countrySelect.selectOption({ label: countryLabel }),
    ]);
    await expect(this.stateSelect).toBeEnabled();
  }

  async selectState(stateLabel) {
    await Promise.all([
      this.page.waitForResponse(
        (response) => response.url().includes('/api/locations/districts') && response.request().method() === 'GET'
      ),
      this.stateSelect.selectOption({ label: stateLabel }),
    ]);
    await expect(this.districtSelect).toBeEnabled();
  }

  async selectDistrict(districtLabel) {
    await this.districtSelect.selectOption({ label: districtLabel });
  }

  async submit() {
    await this.submitBtn.click();
  }
}
