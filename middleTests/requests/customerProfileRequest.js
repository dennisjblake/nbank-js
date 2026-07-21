import Customer from '../models/Customer.js';
import HttpClient from '../utils/httpClient.js';

export default class CustomerProfileRequest {
  constructor() {
    this.httpClient = new HttpClient();
  }

  async getProfileInfo(authToken) {
    const response = await this.httpClient.get('/customer/profile', {
      headers: {
        Authorization: authToken,
      },
    });
    return {
      status: response.status,
      responseData: Customer.fromJson(response.data),
    };
  }
}
