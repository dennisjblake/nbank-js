import CustomerAccountsResponse from '../models/customerAccountsResponse.js';
import HttpClient from '../utils/httpClient.js';

export default class CustomerAccountsRequester {
  constructor() {
    this.httpClient = new HttpClient();
  }

  async getAccounts(authToken) {
    const response = await this.httpClient.get('/customer/accounts', {
      headers: {
        Authorization: authToken,
      },
    });
    return {
      status: response.status,
      responseData: response.data.map((account) =>
        CustomerAccountsResponse.fromJson(account),
      ),
    };
  }
}
