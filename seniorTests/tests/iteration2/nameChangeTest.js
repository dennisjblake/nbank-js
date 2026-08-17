import { HttpStatusCode } from 'axios';
import { expect } from 'chai';
import MESSAGE from '../../utils/message.js';
import ROLE from '../../utils/roles.js';
import { AdminSteps } from '../../utils/steps/adminSteps.js';
import { UserSteps } from '../../utils/steps/userSteps.js';

describe('API Name Change Tests', function () {
  const validData = [
    { name: 'ANNA MARIA' },
    { name: 'anna maria' },
    { name: 'AnnA maRIA' },
    { name: 'A m' },
  ];
  validData.forEach(({ name }) => {
    it(`user can change name to correct value "${name}"`, async () => {
      // create user
      const { token, requestData, responseData } =
        await AdminSteps.createUserAndLogin();
      const stepsUser1 = new UserSteps({ token });
      // change name
      const { data } = await stepsUser1.changeProfileName(name);

      expect(data.customer.role).to.equal(ROLE.USER);
      expect(data.customer.username).to.equal(requestData.username);

      // check the result
      const { data: customerProfileResponse } =
        await stepsUser1.getProfileInfo();

      expect(customerProfileResponse.name).to.equal(name);
      expect(customerProfileResponse.username).to.equal(requestData.username);
      expect(customerProfileResponse.role).to.equal(ROLE.USER);
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
    it(`user cannot change name to incorrect value "${name}"`, async () => {
      // create user
      const { token, requestData, responseData } =
        await AdminSteps.createUserAndLogin();
      const stepsUser1 = new UserSteps({ token });
      // change name - expect error
      await stepsUser1.changeProfileNameWithError(
        name,
        HttpStatusCode.BadRequest,
        MESSAGE.INCORRECT_NAME,
      );

      // check the result - name should remain null
      const { data: customerProfileResponse } =
        await stepsUser1.getProfileInfo();

      expect(customerProfileResponse.name).to.equal(null);
      expect(customerProfileResponse.username).to.equal(requestData.username);
      expect(customerProfileResponse.role).to.equal(ROLE.USER);
    });
  });
});
