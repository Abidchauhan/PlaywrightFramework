export class OtpVerifyPage {
  constructor(page) {
    this.page = page;
    this.otpInput = page.getByTestId('otp-input');
    this.submitBtn = page.getByTestId('otp-submit-btn');
    this.errorMsg = page.getByTestId('otp-error-msg');
  }

  async verify(otp) {
    await this.otpInput.fill(otp);
    await this.submitBtn.click();
  }
}
