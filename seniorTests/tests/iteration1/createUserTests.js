import { expect } from 'chai';
import { assertThatModels } from '../../models/comparison/modelAssertions.js';
import CreateUserRequest from '../../models/createUserRequest.js';
import ExpectedError from '../../models/expectedError.js';
import ApiConfig from '../../utils/apiConfig.js';
import { ENDPOINT_KEY } from '../../utils/endpoints.js';
import ErrorHandlingRequester from '../../utils/errorHandlingRequester.js';
import HTTP_STATUS from '../../utils/httpStatus.js';
import MESSAGE from '../../utils/message.js';
import ROLE from '../../utils/roles.js';
import { AdminSteps } from '../../utils/steps/adminSteps.js';

describe('Admin Service Tests', function () {
  it('admin should be able to create a user', async () => {
    const { requestData, responseData, status } = await AdminSteps.createUser();

    expect(status).to.equal(HTTP_STATUS.CREATED);

    await assertThatModels(requestData, responseData).match();
  });

  const invalidData = [
    {
      username: '',
      password: 'password123!',
      role: ROLE.USER,
      errorKey: 'username',
      errorMessage: MESSAGE.USERNAME_BLANK,
    },
    {
      username: 'ab',
      password: 'password123!',
      role: ROLE.USER,
      errorKey: 'username',
      errorMessage: MESSAGE.USERNAME_BETWEEN_3_15,
    },
    {
      username: 'abc$',
      password: 'password123!',
      role: ROLE.USER,
      errorKey: 'username',
      errorMessage: MESSAGE.USERNAME_LETTERS_DIGITS_DASHES,
    },
    {
      username: 'abc%',
      password: 'password123!',
      role: ROLE.USER,
      errorKey: 'username',
      errorMessage: MESSAGE.USERNAME_LETTERS_DIGITS_DASHES,
    },
  ];
  invalidData.forEach(
    ({ username, password, role, errorKey, errorMessage }) => {
      it(`admin should not be able to create a new user with invalid username: '${username}'`, async () => {
        const errorRequest = new ErrorHandlingRequester();

        const expectedError = new ExpectedError({
          statusCode: HTTP_STATUS.BAD_REQUEST,
          errorKey,
          errorMessage,
        });

        await errorRequest.requestExpectingError(ENDPOINT_KEY.ADMIN_USER, {
          data: new CreateUserRequest({ username, password, role }),
          config: ApiConfig.adminAuth,
          expectedError,
        });
      });
    },
  );
});
