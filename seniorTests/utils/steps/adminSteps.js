import Requester from '../requester.js';
import ApiConfig from '../apiConfig.js';
import CreateUserRequest from '../../models/createUserRequest.js';
import { ENDPOINT_KEY } from '../endpoints.js';
import LoginUserRequest from '../../models/loginUserRequest.js';

export class AdminSteps {
  static async createUser() {
    const userData = CreateUserRequest.generateUserData();
    const requester = new Requester();
    const response = await requester.request(ENDPOINT_KEY.ADMIN_USER, {
      data: userData,
      config: ApiConfig.adminAuth,
    });
    return {
      requestData: userData,
      responseData: response.data,
      status: response.status,
    };
  }
  static async createUserAndLogin() {
    const userData = CreateUserRequest.generateUserData();
    const requester = new Requester();
    const responseCreateUser = await requester.request(
      ENDPOINT_KEY.ADMIN_USER,
      {
        data: userData,
        config: ApiConfig.adminAuth,
      },
    );
    const username = userData.username;
    const password = userData.password;
    const responseLogin = await requester.request(ENDPOINT_KEY.LOGIN, {
      data: new LoginUserRequest({ username, password }),
    });
    return {
      token: responseLogin.headers.authorization,
      status: responseLogin.status,
      requestData: userData,
      responseData: responseLogin.data,
    };
  }
}
