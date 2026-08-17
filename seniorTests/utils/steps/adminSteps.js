import { HttpStatusCode } from 'axios';
import { expect } from 'playwright/test';
import CreateUserRequest from '../../models/createUserRequest.js';
import LoginUserRequest from '../../models/loginUserRequest.js';
import ApiConfig from '../apiConfig.js';
import { ENDPOINT_KEY } from '../endpoints.js';
import Requester from '../requester.js';

export class AdminSteps {
  static async createUser() {
    const userData = CreateUserRequest.generateUserData();
    const requester = new Requester();
    const response = await requester.request(ENDPOINT_KEY.ADMIN_USER, {
      data: userData,
      config: ApiConfig.adminAuth,
    });
    expect(response.status).toBe(HttpStatusCode.Created);
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
    expect(responseCreateUser.status).toBe(HttpStatusCode.Created);
    const username = userData.username;
    const password = userData.password;
    const responseLogin = await requester.request(ENDPOINT_KEY.LOGIN, {
      data: new LoginUserRequest({ username, password }),
    });
    expect(responseLogin.status).toBe(HttpStatusCode.Ok);
    return {
      token: responseLogin.headers.authorization,
      status: responseLogin.status,
      requestData: userData,
      responseData: responseLogin.data,
    };
  }
  static async getAllUsers() {
    const requester = new Requester();

    const response = await requester.request(ENDPOINT_KEY.GET_USERS, {
      config: ApiConfig.adminAuth,
    });
    return {
      responseData: response.data,
      status: response.status,
    };
  }
}
