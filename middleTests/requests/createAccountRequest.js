import CreateAccountResponse from '../models/createAccountResponse.js';
import HttpClient from '../utils/httpClient.js';

export default class CreateAccountRequest {
  constructor() {
    this.httpClient = new HttpClient();
  }

  async createAccount(authToken) {
    const response = await this.httpClient.post(
      '/accounts',
      {},
      {
        headers: {
          Authorization: authToken,
        },
      },
    );
    return {
      status: response.status,
      responseData: CreateAccountResponse.fromJson(response.data),
    };
  }
}
