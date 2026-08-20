export class AddressesPage {
  constructor(page) {
    this.page = page;
    this.addBtn = page.getByTestId('addresses-add-btn');
    this.emptyMsg = page.getByTestId('addresses-empty-msg');
    this.labelSelect = page.getByTestId('addresses-form-label');
    this.addressInput = page.getByTestId('addresses-form-address');
    this.countrySelect = page.getByTestId('addresses-form-country');
    this.stateSelect = page.getByTestId('addresses-form-state');
    this.districtSelect = page.getByTestId('addresses-form-district');
    this.cancelBtn = page.getByTestId('addresses-form-cancel-btn');
    this.submitBtn = page.getByTestId('addresses-form-submit');
  }

  async goto() {
    await this.page.goto('http://localhost:5173/addresses');
  }

  async startAdd() {
    await this.addBtn.click();
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
  }

  async selectState(stateLabel) {
    await Promise.all([
      this.page.waitForResponse(
        (response) => response.url().includes('/api/locations/districts') && response.request().method() === 'GET'
      ),
      this.stateSelect.selectOption({ label: stateLabel }),
    ]);
  }

  async selectDistrict(districtLabel) {
    await this.districtSelect.selectOption({ label: districtLabel });
  }

  async fillAndSubmit({ label, address, country, state, district }) {
    await this.labelSelect.selectOption({ label });
    await this.addressInput.fill(address);
    await this.selectCountry(country);
    await this.selectState(state);
    await this.selectDistrict(district);
    await this.submitBtn.click();
  }
}
