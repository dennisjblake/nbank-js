import HttpClient from '../utils/httpClient.js';
import NameChangeResponse from '../models/nameChangeResponse.js';
import NameChangeRequest from '../models/nameChangeRequest.js';

export default class NameChangeRequester {
  constructor() {
    this.httpClient = new HttpClient();
  }

  async changeName(name, authToken) {
    const response = await this.httpClient.put(
      '/customer/profile',
      new NameChangeRequest(name),
      {
        headers: {
          Authorization: authToken,
        },
        validateStatus: () => true,
      },
    );

    if (response.status === 200) {
      return {
        status: response.status,
        responseData: NameChangeResponse.fromJson(response.data),
      };
    }

    return {
      status: response.status,
      responseData: response.data,
    };
  }
}
