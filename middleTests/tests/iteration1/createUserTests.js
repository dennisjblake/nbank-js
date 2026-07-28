import AdminCreateUserRequest from '../../requests/adminCreateUserRequest.js';
import { expect } from 'chai';
import { HttpStatusCode } from 'axios';

describe('Admin Service Tests', function () {
  it('admin should be able to create a user', async () => {
    const adminCreateUserRequest = new AdminCreateUserRequest();
    const { sentData, response, status } =
      await adminCreateUserRequest.createUser('USER');

    expect(status).to.equal(HttpStatusCode.Created);
    expect(response.username).to.equal(sentData.username);
    expect(response.role).to.equal(sentData.role);
  });

  const invalidData = [
    {
      username: '',
      errorKey: 'username',
      errorMessage: 'Username cannot be blank',
    },
    {
      username: 'ab',
      errorKey: 'username',
      errorMessage: 'Username must be between 3 and 15 characters',
    },
    {
      username: 'abc$',
      errorKey: 'username',
      errorMessage:
        'Username must contain only letters, digits, dashes, underscores, and dots',
    },
    {
      username: 'abc%',
      errorKey: 'username',
      errorMessage:
        'Username must contain only letters, digits, dashes, underscores, and dots',
    },
  ];
  invalidData.forEach(
    ({ username, password, role, errorKey, errorMessage }) => {
      it(`admin should not be able to create a new user with invalid username: '${username}'`, async () => {
        const { response, status } =
          await new AdminCreateUserRequest().createUser({
            username: username,
          });

        expect(status).to.equal(HttpStatusCode.BadRequest);
        expect(response[errorKey]).to.contain(errorMessage);
      });
    },
  );
});
