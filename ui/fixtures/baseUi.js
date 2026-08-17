import { test as base } from '@playwright/test';
import { HttpStatusCode } from 'axios';
import LoginUserRequest from '../../seniorTests/models/loginUserRequest.js';
import { ENDPOINT_KEY } from '../../seniorTests/utils/endpoints.js';
import Requester from '../../seniorTests/utils/requester.js';

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

  authAsUserWithCreds: async ({ page }, use) => {
    async function authAsUser({ username, password, goto = '/' }) {
      const requester = new Requester();
      const { status, headers } = await requester.request(ENDPOINT_KEY.LOGIN, {
        data: new LoginUserRequest({ username, password }),
      });
      if (status !== HttpStatusCode.Ok) {
        throw new Error(`Login failed with status ${status}`);
      }

      const token = headers.authorization;
      if (!token) throw new Error('Authorization header is missing');

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
