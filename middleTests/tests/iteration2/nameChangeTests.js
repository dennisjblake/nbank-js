import { expect } from 'chai';
import AdminCreateUserRequest from '../../requests/adminCreateUserRequest.js';
import GenerateTokenRequest from '../../requests/generateTokenRequest.js';
import NameChangeRequester from '../../requests/nameChangeRequester.js';
import CustomerProfileRequest from '../../requests/customerProfileRequest.js';

describe('API Name Change Tests', function () {
  const validData = [
    { name: 'ANNA MARIA' },
    { name: 'anna maria' },
    { name: 'AnnA maRIA' },
    { name: 'A m' },
  ];
  validData.forEach(({ name }) => {
    it(`user can change name to correct value "${name}"`, async () => {
      const user = await new AdminCreateUserRequest().createUser();
      expect(user.status).to.equal(201);
      const loginRequest = await new GenerateTokenRequest().login({
        username: user.response.username,
        password: user.response.password,
      });

      const authToken = loginRequest.headers.Authorization;

      const { status: changeNameStatus, responseData: changeNameResponse } =
        await new NameChangeRequester().changeName(name, authToken);
      expect(changeNameStatus).to.equal(200);
      expect(changeNameResponse.message).to.equal(
        'Profile updated successfully',
      );
      expect(changeNameResponse.customer.name).to.equal(name);
      expect(changeNameResponse.customer.role).to.equal('USER');
      expect(changeNameResponse.customer.username).to.equal(
        user.response.username,
      );

      const {
        status: customerProfileStatus,
        responseData: customerProfileResponse,
      } = await new CustomerProfileRequest().getProfileInfo(authToken);
      expect(customerProfileStatus).to.equal(200);
      expect(customerProfileResponse.name).to.equal(name);
      expect(customerProfileResponse.username).to.equal(user.response.username);
      expect(customerProfileResponse.role).to.equal('USER');
    });
  });

  const invalidData = [
    { name: ' ANNA MARIA' },
    { name: 'ANNA MARIA ' },
    { name: 'ANNA MARIA12' },
    { name: '12 12' },
    { name: 'ANNA' },
    { name: ' ANNA' },
    { name: 'ANNA ' },
    { name: 'ANNA B MARIA' },
    { name: 'anna 22' },
    { name: '22 ANNA' },
    { name: 'ANNA MARIA 22' },
    { name: '!@#$%^&*()_+[]{}|;:,./<>?' },
    { name: ' ' },
    { name: 'ANNA MARIA!' },
  ];
  invalidData.forEach(({ name }) => {
    it(`user can change name to inccorrect value "${name}"`, async () => {
      const user = await new AdminCreateUserRequest().createUser();

      expect(user.status).to.equal(201);
      const loginRequest = await new GenerateTokenRequest().login({
        username: user.response.username,
        password: user.response.password,
      });

      const authToken = loginRequest.headers.Authorization;

      const { status: changeNameStatus, responseData: changeNameResponse } =
        await new NameChangeRequester().changeName(name, authToken);
      expect(changeNameStatus).to.equal(400);
      expect(changeNameResponse).to.equal(
        'Name must contain two words with letters only',
      );

      const {
        status: customerProfileStatus,
        responseData: customerProfileResponse,
      } = await new CustomerProfileRequest().getProfileInfo(authToken);
      expect(customerProfileStatus).to.equal(200);
      expect(customerProfileResponse.name).to.equal(null);
      expect(customerProfileResponse.username).to.equal(user.response.username);
      expect(customerProfileResponse.role).to.equal('USER');
    });
  });
});
