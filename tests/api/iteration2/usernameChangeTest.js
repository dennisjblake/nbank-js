import axios from 'axios';
import { expect } from 'chai';

const baseUrl = 'http://localhost:4111/api/v1';

describe('API Username Change Tests', function () {
  const validData = [
    { username: 'ANNA MARIA' },
    { username: 'anna maria' },
    { username: 'AnnA maRIA' },
    { username: 'A m' },
  ];
  validData.forEach(({ username }) => {
    it(`user can change name to correct value "${username}"`, async function () {
      // creating a new user

      const randomName = Math.random().toString(36).substring(2, 12);

      const createUserResponse = await axios.post(
        `${baseUrl}/admin/users`,
        {
          username: randomName,
          password: 'Portal123!',
          role: 'USER',
        },
        {
          headers: { authorization: 'Basic YWRtaW46YWRtaW4=' },
        },
      );
      expect(createUserResponse.status).to.equal(201);
      const generateUserTokenResponse = await axios.post(
        `${baseUrl}/auth/login`,
        {
          username: randomName,
          password: 'Portal123!',
        },
      );
      expect(generateUserTokenResponse.status).to.equal(200);

      const userAuthToken = generateUserTokenResponse.headers['authorization'];
      // Customer Username changing
      const changeUsernameResponse = await axios.put(
        `${baseUrl}/customer/profile`,
        {
          name: username,
        },
        {
          headers: { authorization: userAuthToken },
        },
      );
      expect(changeUsernameResponse.status).to.equal(200);
      expect(changeUsernameResponse.data['message']).to.equal(
        'Profile updated successfully',
      );
      expect(changeUsernameResponse.data['customer'].name).to.equal(username);
      expect(changeUsernameResponse.data['customer'].username).to.equal(
        randomName,
      );
      // verify account information
      const customerProfileResponse = await axios.get(
        `${baseUrl}/customer/profile`,
        {
          headers: { Authorization: userAuthToken },
        },
      );
      expect(customerProfileResponse.status).to.equal(200);
      expect(customerProfileResponse.data.name).to.equal(username);
      expect(customerProfileResponse.data.username).to.equal(randomName);
      expect(customerProfileResponse.data.role).to.equal('USER');
    });
  });
  const invalidData = [
    { username: ' ANNA MARIA' },
    { username: 'ANNA MARIA ' },
    { username: 'ANNA MARIA12' },
    { username: '12 12' },
    { username: 'ANNA' },
    { username: ' ANNA' },
    { username: 'ANNA ' },
    { username: 'ANNA B MARIA' },
    { username: 'anna 22' },
    { username: '22 ANNA' },
    { username: 'ANNA MARIA 22' },
    { username: '!@#$%^&*()_+[]{}|;:,./<>?' },
    { username: ' ' },
    { username: 'ANNA MARIA!' },
  ];
  invalidData.forEach(({ username }) => {
    it(`user can change name to inccorrect value "${username}"`, async function () {
      const randomName = Math.random().toString(36).substring(2, 12);
      // creating a new user
      const createUserResponse = await axios.post(
        `${baseUrl}/admin/users`,
        {
          username: randomName,
          password: 'Portal123!',
          role: 'USER',
        },
        {
          headers: { authorization: 'Basic YWRtaW46YWRtaW4=' },
        },
      );
      expect(createUserResponse.status).to.equal(201);
      const generateUserTokenResponse = await axios.post(
        `${baseUrl}/auth/login`,
        {
          username: randomName,
          password: 'Portal123!',
        },
      );
      expect(generateUserTokenResponse.status).to.equal(200);

      const userAuthToken = generateUserTokenResponse.headers['authorization'];
      // Customer Username changing
      const changeUsernameResponse = await axios.put(
        `${baseUrl}/customer/profile`,
        {
          name: username,
        },
        {
          headers: { authorization: userAuthToken },
          validateStatus: () => true,
        },
      );

      expect(changeUsernameResponse.status).to.equal(400);
      expect(changeUsernameResponse.data).to.equal(
        'Name must contain two words with letters only',
      );
      // verify account information
      const customerProfileResponse = await axios.get(
        `${baseUrl}/customer/profile`,
        {
          headers: { authorization: userAuthToken },
        },
      );
      expect(customerProfileResponse.status).to.equal(200);
      expect(customerProfileResponse.data.name).to.equal(null);
      expect(customerProfileResponse.data.username).to.equal(randomName);
      expect(customerProfileResponse.data.role).to.equal('USER');
    });
  });
});
