import { AdminSteps } from '../../seniorTests/utils/steps/adminSteps.js';
import { test as sessionBase } from './sessionStorage.js';

export const test = sessionBase.extend({
  withUserSession: [
    async ({ sessionStorage }, use) => {
      async function withUserSessions(n = 1) {
        const sessions = [];
        for (let i = 0; i < n; i++) {
          const { requestData } = await AdminSteps.createUser();
          sessionStorage.addUsers([requestData]);
          const { steps } = sessionStorage.getByUsername(requestData.username);
          const token = await steps.ensureToken();
          sessions.push({ user: requestData, steps, token });
        }
        return sessions;
      }

      await use(withUserSessions);
    },
    { scope: 'worker' },
  ],
});

export const expect = test.expect;
