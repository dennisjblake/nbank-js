import CreateUserRequest from '../models/createUserRequest.js';
import CreateUserResponse from '../models/createUserResponse.js';
import ApiConfig from '../utils/apiConfig.js';
import HttpClient from '../utils/httpClient.js';

export default class AdminCreateUserRequest {
  constructor() {
    this.httpClient = new HttpClient();
  }

  async createUser({ username, password, role = 'USER' } = {}) {
    const userData = new CreateUserRequest(
      username ?? CreateUserRequest.generateUsername(),
      password ?? CreateUserRequest.generatePassword(),
      role,
    );
    const originalPassword = userData.password;
    const response = await this.httpClient.post('/admin/users', userData, {
      headers: ApiConfig.adminAuth.headers,
      validateStatus: () => true,
    });
    const userResponse = CreateUserResponse.fromJson(response.data);
    return {
      status: response.status,
      sentData: userData,
      response: {
        ...userResponse.toJson(),
        password: originalPassword,
      },
    };
  }
}
