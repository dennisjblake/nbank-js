import { expect } from 'playwright/test';

export default class BasePage {
  constructor(page) {
    this.page = page;
  }

  async open() {
    await this.page.goto(this.url);
    return this;
  }

  get usernameInput() {
    return this.page.getByPlaceholder('Username');
  }
  get passwordInput() {
    return this.page.getByPlaceholder('Password');
  }
  get button() {
    return this.page.getByRole('button');
  }
  getPage(PageClass) {
    return new PageClass(this.page);
  }
  async checkAlertAndAccept(bankAlert, trigger) {
    const [dialog] = await Promise.all([
      this.page.waitForEvent('dialog'),
      trigger(),
    ]);
    expect(dialog.message()).toContain(bankAlert.message);
    const text = dialog.message();
    await dialog.accept();
    return text;
  }
  async checkAlertAndExtractAndAccept(bankAlert, trigger, regex) {
    const text = await this.checkAlertAndAccept(bankAlert, trigger);
    const match = text.match(regex);
    expect(match, `Alert was: "${text}"`).toBeTruthy();
    return match[1];
  }
}
