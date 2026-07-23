import Requester from '../requester.js';
import ApiConfig from '../apiConfig.js';
import CreateUserRequest from '../../models/createUserRequest.js';
import { config } from 'dotenv';

export class AdminSteps {
  static async createUser() {
    const userData = CreateUserRequest.generateUserData();

    const requester = new Requester();
    const response = await requester.request('ADMIN_USER', {
      data: userData,
      config: ApiConfig.adminAuth,
    });
    return {
      requestData: userData,
      responseData: response.data,
      status: response.status,
    };
  }
}
