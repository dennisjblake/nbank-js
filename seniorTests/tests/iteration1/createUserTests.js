import { expect } from 'chai';
import { AdminSteps } from '../../utils/steps/adminSteps.js';
import { assertThatModels } from '../../models/comparison/modelAssertions.js';
import ApiConfig from '../../utils/apiConfig.js';
import CreateUserRequest from '../../models/createUserRequest.js';
import { ENDPOINT_KEY } from '../../utils/endpoints.js';
import HTTP_STATUS from '../../utils/httpStatus.js';
import ErrorHandlingRequester from '../../utils/errorHandlingRequester.js';
import ExpectedError from '../../models/expectedError.js';

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
      role: 'USER',
      errorKey: 'username',
      errorMessage: 'Username cannot be blank',
    },
    {
      username: 'ab',
      password: 'password123!',
      role: 'USER',
      errorKey: 'username',
      errorMessage: 'Username must be between 3 and 15 characters',
    },
    {
      username: 'abc$',
      password: 'password123!',
      role: 'USER',
      errorKey: 'username',
      errorMessage:
        'Username must contain only letters, digits, dashes, underscores, and dots',
    },
    {
      username: 'abc%',
      password: 'password123!',
      role: 'USER',
      errorKey: 'username',
      errorMessage:
        'Username must contain only letters, digits, dashes, underscores, and dots',
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
