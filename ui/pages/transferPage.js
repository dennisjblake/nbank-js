import { HttpStatusCode } from 'axios';
import { expect } from 'playwright/test';
import BasePage from './basePage.js';
import URL from './url.js';

export default class TransferPage extends BasePage {
  get url() {
    return URL.TRANSFER;
  }

  get sendTransferButton() {
    return this.page.getByText('🚀 Send Transfer', { exact: true });
  }

  get transferPageText() {
    return this.page.getByRole('heading', {
      name: '🔄 Make a Transfer',
    });
  }

  get accountSelector() {
    return this.page.locator('.account-selector');
  }

  get recipientNameInput() {
    return this.page.locator('[placeholder="Enter recipient name"]');
  }

  get recipientAccountNumber() {
    return this.page.locator('[placeholder="Enter recipient account number"]');
  }

  get amountInput() {
    return this.page.locator('[placeholder="Enter amount"]');
  }

  get confirmCheckbox() {
    return this.page.locator('#confirmCheck');
  }

  get homeButton() {
    return this.page.getByRole('button', { name: '🏠 Home' });
  }

  async navigateToUserDashboad() {
    await this.homeButton.click();
  }

  async makeTransfer({ senderAccount, receiverAccount, amount } = {}) {
    const receiverAccNumber =
      receiverAccount === 0 ? 0 : receiverAccount?.accountNumber;

    if (senderAccount === undefined || receiverAccNumber === undefined) {
      await this.sendTransferButton.click();
      return this;
    }

    await expect(this.accountSelector).toBeVisible();
    await expect(
      this.accountSelector.locator(`option[value="${senderAccount.id}"]`),
    ).toBeAttached();

    await this.accountSelector.selectOption(String(senderAccount.id));
    await expect(this.accountSelector).toHaveValue(String(senderAccount.id));
    await this.recipientNameInput.fill(String(receiverAccNumber));
    await expect(this.recipientNameInput).toHaveValue(
      String(receiverAccNumber),
    );
    await this.recipientAccountNumber.fill(String(receiverAccNumber));
    await expect(this.recipientAccountNumber).toHaveValue(
      String(receiverAccNumber),
    );
    await this.amountInput.fill(String(amount));
    await expect(this.amountInput).toHaveValue(String(amount));
    await this.confirmCheckbox.check();
    await expect(this.confirmCheckbox).toBeChecked();

    const isValidTransfer =
      receiverAccNumber !== 0 && senderAccount.balance !== 0 && amount >= 0;
    const postTransferPromise = isValidTransfer
      ? this.page.waitForResponse(
          (response) =>
            response.url().includes('transfer') &&
            response.request().method() === 'POST' &&
            [HttpStatusCode.Ok].includes(response.status()),
        )
      : Promise.resolve();
    await this.sendTransferButton.click();
    await postTransferPromise;
    return this;
  }

  async expectLoaded() {
    await expect(this.transferPageText).toBeVisible();
    await expect(this.transferPageText).toHaveText('🔄 Make a Transfer');
    await expect(this.page).toHaveURL(this.url);
    return this;
  }
}
