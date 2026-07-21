import HttpClient from '../utils/httpClient.js';
import ApiConfig from '../utils/apiConfig.js';
import LoginUserRequest from '../models/loginUserRequest.js';
import LoginUserResponse from '../models/loginUserResponse.js';

export default class GenerateTokenRequest {
  constructor() {
    this.httpClient = new HttpClient();
  }

  async login({ username, password }) {
    const response = await this.httpClient.post(
      '/auth/login',
      new LoginUserRequest(username, password),
      ApiConfig.unauth.headers,
    );

    const parsedResponse = LoginUserResponse.fromJson(response.data);
    return {
      status: response.status,
      headers: { Authorization: response.headers.authorization },
      response: parsedResponse,
    };
  }
}
