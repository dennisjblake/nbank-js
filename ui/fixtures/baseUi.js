import { test as base } from '@playwright/test';

export const test = base.extend({
  authAsUser: async ({ page }, use) => {
    async function authAsUser({ token, goto = '/' } = {}) {
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
