import { expect } from 'chai';
import HTTP_STATUS from '../../utils/httpStatus.js';
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

      // change name
      const { data, status } = await UserSteps.changeProfileName(name, token);

      expect(status).to.equal(HTTP_STATUS.OK);
      expect(data.message).to.equal(MESSAGE.PROFILE_UPDATED_SUCCESSFULLY);
      expect(data.customer.name).to.equal(name);
      expect(data.customer.role).to.equal(ROLE.USER);
      expect(data.customer.username).to.equal(requestData.username);

      // check the result
      const { status: customerProfileStatus, data: customerProfileResponse } =
        await UserSteps.getProfileInfo(token);

      expect(customerProfileStatus).to.equal(HTTP_STATUS.OK);
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

      // change name - expect error
      await UserSteps.changeProfileNameWithError(
        name,
        token,
        HTTP_STATUS.BAD_REQUEST,
        MESSAGE.INCORRECT_NAME,
      );

      // check the result - name should remain null
      const { status: customerProfileStatus, data: customerProfileResponse } =
        await UserSteps.getProfileInfo(token);

      expect(customerProfileStatus).to.equal(HTTP_STATUS.OK);
      expect(customerProfileResponse.name).to.equal(null);
      expect(customerProfileResponse.username).to.equal(requestData.username);
      expect(customerProfileResponse.role).to.equal(ROLE.USER);
    });
  });
});
