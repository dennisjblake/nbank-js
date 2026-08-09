import AdminCreateUserRequest from '../../requests/adminCreateUserRequest.js';
import { expect } from 'chai';
import { HttpStatusCode } from 'axios';
import ROLE from '../../utils/roles.js';
import MESSAGE from '../../utils/message.js';

describe('Admin Service Tests', function () {
  it('admin should be able to create a user', async () => {
    const adminCreateUserRequest = new AdminCreateUserRequest();
    const { sentData, response, status } =
      await adminCreateUserRequest.createUser(ROLE.USER);

    expect(status).to.equal(HttpStatusCode.Created);
    expect(response.username).to.equal(sentData.username);
    expect(response.role).to.equal(sentData.role);
  });

  const invalidData = [
    {
      username: '',
      errorKey: 'username',
      errorMessage: MESSAGE.USERNAME_BLANK,
    },
    {
      username: 'ab',
      errorKey: 'username',
      errorMessage: MESSAGE.USERNAME_BETWEEN_3_15,
    },
    {
      username: 'abc$',
      errorKey: 'username',
      errorMessage: MESSAGE.USERNAME_LETTERS_DIGITS_DASHES,
    },
    {
      username: 'abc%',
      errorKey: 'username',
      errorMessage: MESSAGE.USERNAME_LETTERS_DIGITS_DASHES,
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
