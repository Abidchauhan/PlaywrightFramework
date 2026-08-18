export class PersonalDetailsPage {
  constructor(page) {
    this.page = page;
    this.nameInput = page.getByTestId('personal-details-name-input');
    this.genderSelect = page.getByTestId('personal-details-gender-select');
    this.ageInput = page.getByTestId('personal-details-age-input');
    this.addressInput = page.getByTestId('personal-details-address-input');
    this.submitBtn = page.getByTestId('personal-details-submit-btn');
    this.errorMsg = page.getByTestId('personal-details-error-msg');
  }

  async fillAndSubmit(name, gender, age, address) {
    await this.nameInput.fill(name);
    await this.genderSelect.selectOption({ label: gender });
    await this.ageInput.fill(String(age));
    await this.addressInput.fill(address);
    await this.submitBtn.click();
  }
}
