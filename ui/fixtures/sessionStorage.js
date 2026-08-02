import { test as base } from 'playwright/test';
import { UserSteps } from '../../seniorTests/utils/steps/userSteps';
import { use } from 'react';

function createSessionStorage() {
  const map = new Map();
  const byUsername = new Map();

  return {
    addUsers(users = []) {
      for (const user of users) {
        const steps = new UserSteps({
          username: user.username,
          password: user.password,
        });
        map.set(user, steps);
        byUsername.set(user.username, { user, steps });
      }
    },
    getAllUsers() {
      return Array.from(map.keys());
    },
    getAllSteps() {
      return Array.from(map.values());
    },
    getUser(index = 0) {
      return this.getAllUsers()[index];
    },
    getStep(index = 0) {
      return this.getAllSteps()[index];
    },
    getStepsByUser(user) {
      return map.get(user);
    },
    getByUsername(username) {
      return byUsername.get(username);
    },
    size() {
      return map.size;
    },
    clear() {
      map.clear();
      byUsername.clear();
    },
  };
}

export const test = base.extend({
  sessionStorage: [
    async ({}, use) => {
      const store = sessionStorage();
      await use(store);
      store.clear();
    },
    { scope: 'worker' },
  ],
});
