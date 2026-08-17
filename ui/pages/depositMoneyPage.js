import { HttpStatusCode } from 'axios';
import { expect } from 'playwright/test';
import ACCOUNT_VALUE from '../../seniorTests/utils/accountValue.js';
import BasePage from './basePage.js';
import URL from './url.js';

export default class DepositMoney extends BasePage {
  get url() {
    return URL.DEPOSIT;
  }

  get depositButton() {
    return this.page.getByText('💵 Deposit', { exact: true });
  }

  get depositMoneyText() {
    return this.page.getByRole('heading', {
      name: '💰 Deposit Money',
    });
  }

  get accountSelector() {
    return this.page.locator('.account-selector');
  }

  get depositAmountInput() {
    return this.page.locator('.deposit-input');
  }

  get homeButton() {
    return this.page.getByRole('button', { name: '🏠 Home' });
  }

  async navigateToUserDashboad() {
    await this.homeButton.click();
  }

  async makeDeposit(accountId, amount) {
    if (accountId !== null) {
      await expect(this.accountSelector).toBeVisible();
      await expect(
        this.accountSelector.locator(`option[value="${accountId}"]`),
      ).toBeAttached();

      await this.accountSelector.selectOption(String(accountId));
      await expect(this.accountSelector).toHaveValue(String(accountId));
    }
    await expect(this.depositAmountInput).toBeVisible();
    await this.depositAmountInput.fill(String(amount));
    await expect(this.depositAmountInput).toHaveValue(String(amount));

    const isValidAmount =
      accountId !== null &&
      amount > ACCOUNT_VALUE.ZERO_VALUE &&
      amount < ACCOUNT_VALUE.VALUE_5K;
    const postDepositPromise = isValidAmount
      ? this.page.waitForResponse(
          (response) =>
            response.url().includes('deposit') &&
            response.request().method() === 'POST' &&
            [HttpStatusCode.Ok].includes(response.status()),
        )
      : Promise.resolve();

    await this.depositButton.click();
    await postDepositPromise;
    return this;
  }

  async checkDepositAlertText(alertText) {}

  async expectLoaded() {
    await expect(this.depositMoneyText).toBeVisible();
    await expect(this.depositMoneyText).toHaveText('💰 Deposit Money');
    await expect(this.page).toHaveURL(this.url);
    return this;
  }
}
