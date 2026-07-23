import Requester from '../requester.js';
import ApiConfig from '../apiConfig.js';
import { config } from 'dotenv';
import { ENDPOINT_KEY } from '../../utils/endpoints.js';
import LoginUserRequest from '../../models/loginUserRequest.js';

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
  static async login({ username, password }) {
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
