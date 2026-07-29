import { test as base } from '@playwright/test';
import { UserSteps } from '../../seniorTests/utils/steps/userSteps.js';
import { HttpStatusCode } from 'axios';

export const test = base.extend({
  authAsUser: async ({ page }, use) => {
    async function authAsUser(username, password, goto = '/') {
      const { token, status } = await UserSteps.loginWithCreds(
        username,
        password,
      );
      if (status !== HttpStatusCode.Ok)
        throw new Error(`Login failed with status code ${status}`);

      if (!token) throw new Error(`Authorization token is missing`);

      await page.addInitScript(
        (t) => window.localStorage.setItem('authToken', t),
        token,
      );
      await page.goto(goto);
      return token;
    }

    await use(authAsUser);
  },
});

export const expect = base.expect;
