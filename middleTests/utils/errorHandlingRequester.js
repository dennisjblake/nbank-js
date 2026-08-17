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
      const responseData = error.response?.data;
      // Handle both string and object response formats
      const actualMessage =
        typeof responseData === 'string'
          ? responseData
          : responseData?.[expectedError.errorKey];

      if (actualStatus !== expectedError.statusCode) {
        throw new Error(
          `Expected status ${expectedError.statusCode}, but got ${actualStatus}`,
        );
      }

      // Only check message if errorMessage is not null
      if (
        expectedError.errorMessage !== null &&
        !actualMessage?.includes(expectedError.errorMessage)
      ) {
        throw new Error(
          `Expected message ${expectedError.errorMessage}, but got ${actualMessage}`,
        );
      }

      return;
    }
  }
}
