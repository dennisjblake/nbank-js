import Requester from './requester.js';

export default class ErrorHandlingRequester {
  constructor() {
    this.requester = new Requester();
  }

  async requestExpectingError(
    endpointKey,
    { data = null, config = {}, expectedError },
  ) {
    try {
      await this.requester.request(endpointKey, { data, config });
    } catch (error) {
      const actualStatus = error.response?.status;
      const actualMessage = error.response?.data?.[expectedError.errorKey];

      if (actualStatus !== expectedError.statusCode) {
        throw new Error(
          `Expected status ${expectedError.statusCode}, but got ${actualStatus}`,
        );
      }
      if (!actualMessage?.includes(expectedError.errorMessage)) {
        throw new Error(
          `Expected message ${expectedError.errorMessage}, but got ${actualMessage}`,
        );
      }

      return;
    }
  }
}
