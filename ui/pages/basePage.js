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
    let text;
    const dialogPromise = new Promise((resolve) => {
      this.page.once('dialog', async (dialog) => {
        text = dialog.message();
        await dialog.accept();
        resolve();
      });
    });
    await Promise.all([dialogPromise, trigger()]);
    expect(text).toContain(bankAlert.message);
    return text;
  }
  async checkAlertAndExtractAndAccept(bankAlert, trigger, regex) {
    const text = await this.checkAlertAndAccept(bankAlert, trigger);
    const match = text.match(regex);
    expect(match, `Alert was: "${text}"`).toBeTruthy();
    return match[1];
  }
}
