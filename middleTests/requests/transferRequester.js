import TransferRequest from '../models/transferRequest.js';
import TransferResponse from '../models/transferResponse.js';
import HttpClient from '../utils/httpClient.js';

export default class TransferRequester {
  constructor() {
    this.httpClient = new HttpClient();
  }

  async transfer(senderAccountId, receiverAccountId, amount, authToken) {
    const response = await this.httpClient.post(
      `/accounts/transfer`,
      new TransferRequest(senderAccountId, receiverAccountId, amount),
      { headers: { authorization: authToken }, validateStatus: () => true },
    );

    if (response.status === 200) {
      return {
        status: response.status,
        responseData: TransferResponse.fromJson(response.data),
      };
    }

    return {
      status: response.status,
      responseData: response.data,
    };
  }
}
