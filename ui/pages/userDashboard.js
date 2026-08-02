import { HttpStatusCode } from 'axios';
import { expect } from 'playwright/test';
import BasePage from './basePage.js';
import URL from './url.js';

export default class UserDashboard extends BasePage {
  get url() {
    return URL.DASHBOARD;
  }

  get welcomeText() {
    return this.page.locator('.welcome-text');
  }

  get profileHeaderLink() {
    return this.page.locator('.profile-header');
  }

  get createAccountButton() {
    return this.page.getByText('➕ Create New Account', { exact: true });
  }
  get makeATransferButton() {
    return this.page.getByText('🔄 Make a Transfer', { exact: true });
  }

  get depositMoneyButton() {
    return this.page.getByText('💰 Deposit Money', { exact: true });
  }

  get userDashboardText() {
    return this.page.getByText('User Dashboard', { exact: true });
  }

  async createAccount() {
    await this.createAccountButton.click();
    return this;
  }

  async openProfileHeaderPage() {
    const getProfileResponses = [
      this.page.waitForResponse(
        (response) =>
          response.url().includes('profile') &&
          response.request().method() === 'GET' &&
          [HttpStatusCode.Ok].includes(response.status()),
      ),
      this.page.waitForResponse(
        (response) =>
          response.url().includes('profile') &&
          response.request().method() === 'GET' &&
          [HttpStatusCode.Ok].includes(response.status()),
      ),
    ];
    await this.profileHeaderLink.click();
    await Promise.all(getProfileResponses);
    await expect(this.page).toHaveURL(URL.EDIT_PROFILE);
    return this;
  }
  async openDepositMoneyPage() {
    const getAccountsResponses = [
      this.page.waitForResponse(
        (response) =>
          response.url().includes('accounts') &&
          response.request().method() === 'GET' &&
          [HttpStatusCode.Ok].includes(response.status()),
      ),
      this.page.waitForResponse(
        (response) =>
          response.url().includes('accounts') &&
          response.request().method() === 'GET' &&
          [HttpStatusCode.Ok].includes(response.status()),
      ),
    ];
    await this.depositMoneyButton.click();
    await Promise.all(getAccountsResponses);
    await expect(this.page).toHaveURL(URL.DEPOSIT);
    return this;
  }

  async openTransferPage() {
    await this.makeATransferButton.click();
    await expect(this.page).toHaveURL(URL.TRANSFER);
    return this;
  }

  async expectLoaded() {
    await expect(this.userDashboardText).toBeVisible();
    await expect(this.page).toHaveURL(this.url);
    return this;
  }

  async expectWelcomeTextToContain(name) {
    await expect(this.welcomeText).toBeVisible();
    await expect(this.welcomeText).toHaveText(`Welcome, ${name}!`);
  }
}
