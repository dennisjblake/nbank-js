import BasePage from './basePage.js';

export default class LoginPage extends BasePage {
  get url() {
    return '/';
  }

  async login(username, password) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.button.click();
    return this;
  }
}
