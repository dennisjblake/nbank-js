import CreateAccountResponse from '../models/createAccountResponse.js';
import CreateUserRequest from '../models/createUserRequest.js';
import CreateUserResponse from '../models/createUserResponse.js';
import LoginUserRequest from '../models/loginUserRequest.js';
import LoginUserResponse from '../models/loginUserResponse.js';
import BaseModel from '../models/baseModel.js';

export const ENDPOINT_KEY = {
  ADMIN_USER: 'ADMIN_USER',
  LOGIN: 'LOGIN',
  ACCOUNTS: 'ACCOUNTS',
};

const endpoints = {
  [ENDPOINT_KEY.ADMIN_USER]: {
    url: '/admin/users',
    method: 'post',
    requestModel: CreateUserRequest,
    responseModel: CreateUserResponse,
  },
  [ENDPOINT_KEY.LOGIN]: {
    url: '/auth/login',
    method: 'post',
    requestModel: LoginUserRequest,
    responseModel: LoginUserResponse,
  },
  [ENDPOINT_KEY.ACCOUNTS]: {
    url: '/accounts',
    method: 'post',
    requestModel: BaseModel,
    responseModel: CreateAccountResponse,
  },
};

export default endpoints;
