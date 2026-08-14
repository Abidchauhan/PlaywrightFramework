export class LoginPage {
  constructor(page) {
    this.page = page;
    this.mobileInput = page.getByTestId('login-mobile-input');
    this.submitBtn = page.getByTestId('login-submit-btn');
    this.errorMsg = page.getByTestId('login-error-msg');
  }

  async goto() {
    await this.page.goto('http://localhost:5173/login');
  }

  async login(mobileNumber) {
    await this.mobileInput.fill(mobileNumber);
    await this.submitBtn.click();
  }
}
