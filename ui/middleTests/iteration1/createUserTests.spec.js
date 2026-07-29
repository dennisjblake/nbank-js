import { generateUser } from '../../../seniorTests/generators/generateRandomUserData.js';
import CreateUserRequest from '../../../seniorTests/models/createUserRequest.js';
import { test, expect } from '../../fixtures/baseUi.js';
import AdminPanel from '../../pages/adminPanelPage.js';
import { BankAlert } from '../../pages/bankAlert.js';
import { assertThatModel } from '../../../seniorTests/models/comparison/modelAssertions.js';
import { AdminSteps } from '../../../seniorTests/utils/steps/adminSteps.js';
import RandExp from 'randexp';

const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

const INVALID_USERNAME = /([A-Za-z0-9]{1-2}|[A-Za-z0-9]{16,})/;

test.describe('Auth Service Tests', () => {
  test('admin should be able to create a new use with correct data', async ({
    page,
    authAsUser,
  }) => {});
});
