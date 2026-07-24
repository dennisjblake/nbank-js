import DepositRequest from '../../models/depositRequest.js';
import ExpectedError from '../../models/expectedError.js';
import LoginUserRequest from '../../models/loginUserRequest.js';
import NameChangeRequest from '../../models/nameChangeRequest.js';
import TransferRequest from '../../models/transferRequest.js';
import { ENDPOINT_KEY } from '../../utils/endpoints.js';
import ErrorHandlingRequester from '../../utils/errorHandlingRequester.js';
import ApiConfig from '../apiConfig.js';
import Requester from '../requester.js';

export class UserSteps {
  static async createAccount(auth) {
    const requester = new Requester();
    const response = await requester.request(ENDPOINT_KEY.ACCOUNTS, {
      data: null,
      config: ApiConfig.getUserAuth(auth),
    });
    return {
      responseData: response.data,
      status: response.status,
    };
  }

  static async changeProfileName(name, auth) {
    const requester = new Requester();
    const response = await requester.request(ENDPOINT_KEY.CHANGE_PROFILE, {
      data: new NameChangeRequest({ name }),
      config: ApiConfig.getUserAuth(auth),
    });
    return {
      data: response.data,
      status: response.status,
    };
  }

  static async deposit(accountId, amount, auth) {
    const requester = new Requester();
    const response = await requester.request(ENDPOINT_KEY.DEPOSIT, {
      data: new DepositRequest({
        id: accountId,
        balance: amount,
      }),
      config: ApiConfig.getUserAuth(auth),
    });
    return {
      data: response.data,
      status: response.status,
    };
  }

  static async transfer(senderAccountId, receiverAccountId, amount, auth) {
    const requester = new Requester();
    const response = await requester.request(ENDPOINT_KEY.TRANSFER, {
      data: new TransferRequest({
        senderAccountId: senderAccountId,
        receiverAccountId: receiverAccountId,
        amount: amount,
      }),
      config: ApiConfig.getUserAuth(auth),
    });
    return {
      data: response.data,
      status: response.status,
    };
  }

  static async transferWithError(
    senderAccountId,
    receiverAccountId,
    amount,
    httpCode,
    errorMessage,
    auth,
  ) {
    const errorRequest = new ErrorHandlingRequester();

    const expectedError = new ExpectedError({
      statusCode: httpCode,
      errorKey: null,
      errorMessage: errorMessage,
    });

    await errorRequest.requestExpectingError(ENDPOINT_KEY.TRANSFER, {
      data: new TransferRequest({
        senderAccountId: senderAccountId,
        receiverAccountId: receiverAccountId,
        amount: amount,
      }),
      config: ApiConfig.getUserAuth(auth),
      expectedError,
    });
  }

  static async depositWithError(
    accountId,
    amount,
    auth,
    httpCode,
    errorMessage = null,
  ) {
    const errorRequest = new ErrorHandlingRequester();

    const expectedError = new ExpectedError({
      statusCode: httpCode,
      errorKey: null,
      errorMessage: errorMessage,
    });

    await errorRequest.requestExpectingError(ENDPOINT_KEY.DEPOSIT, {
      data: new DepositRequest({
        id: accountId,
        balance: amount,
      }),
      config: ApiConfig.getUserAuth(auth),
      expectedError,
    });
  }

  static async changeProfileNameWithError(name, auth, httpCode, errorMessage) {
    const errorRequest = new ErrorHandlingRequester();

    const expectedError = new ExpectedError({
      statusCode: httpCode,
      errorKey: null,
      errorMessage: errorMessage,
    });

    await errorRequest.requestExpectingError(ENDPOINT_KEY.CHANGE_PROFILE, {
      data: new NameChangeRequest({ name }),
      config: ApiConfig.getUserAuth(auth),
      expectedError,
    });
  }

  static async getProfileInfo(auth) {
    const requester = new Requester();
    const response = await requester.request(ENDPOINT_KEY.GET_PROFILE, {
      data: null,
      config: ApiConfig.getUserAuth(auth),
    });
    return {
      data: response.data,
      status: response.status,
    };
  }

  static async getUserAccounts(auth) {
    const requester = new Requester();
    const response = await requester.request(ENDPOINT_KEY.GET_ACCOUNTS, {
      data: null,
      config: ApiConfig.getUserAuth(auth),
    });
    return {
      data: response.data,
      status: response.status,
    };
  }

  static async getAccountById(id, auth) {
    const { status: customerAccountStatus, data: customerAccountsResponse } =
      await UserSteps.getUserAccounts(auth);
    return customerAccountsResponse.find((a) => a.id === id);
  }

  static async login(createdUserRequestData) {
    const requester = new Requester();
    const username = createdUserRequestData.username;
    const password = createdUserRequestData.password;
    const response = await requester.request(ENDPOINT_KEY.LOGIN, {
      data: new LoginUserRequest({ username, password }),
    });
    return {
      token: response.headers.authorization,
      status: response.status,
    };
  }
  static async loginWithCreds(username, password) {
    const requester = new Requester();
    const response = await requester.request(ENDPOINT_KEY.LOGIN, {
      data: new LoginUserRequest({ username, password }),
    });
    return {
      token: response.headers.authorization,
      status: response.status,
    };
  }
}
