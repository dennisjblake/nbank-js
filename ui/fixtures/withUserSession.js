import { use } from 'react';
import { AdminSteps } from '../../seniorTests/utils/steps/adminSteps.js';
import { test as sessionBase } from './sessionStorage.js';

export const test = sessionBase.extend({
  withUserSession: [
    async ({ sessionStorage }, use) => {
      async function withUserSession(n = 1) {
        const sessions = [];
        for (let i = 0; i < n; i++) {}
      }
    },
  ],
});
