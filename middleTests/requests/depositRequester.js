import HttpClient from '../utils/httpClient.js';
import DepositRequest from '../models/depositRequest.js';
import DepositResponse from '../models/depositResponse.js';

export default class DepositRequester {
  constructor() {
    this.httpClient = new HttpClient();
  }

  async deposit(receiverAccountId, amount, authToken) {
    const response = await this.httpClient.post(
      `/accounts/deposit`,
      new DepositRequest(receiverAccountId, amount),
      {
        headers: { authorization: authToken },
        validateStatus: () => true,
      },
    );
    if (response.status === 200) {
      return {
        status: response.status,
        responseData: DepositResponse.fromJson(response.data),
      };
    }

    return {
      status: response.status,
      responseData: response.data,
    };
  }
}
