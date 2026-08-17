import BaseModel from '../models/baseModel.js';
import CreateAccountResponse from '../models/createAccountResponse.js';
import CreateUserRequest from '../models/createUserRequest.js';
import CreateUserResponse from '../models/createUserResponse.js';
import Customer from '../models/Customer.js';
import CustomerAccountsResponse from '../models/customerAccountsResponse.js';
import DepositRequest from '../models/depositRequest.js';
import DepositResponse from '../models/depositResponse.js';
import LoginUserRequest from '../models/loginUserRequest.js';
import LoginUserResponse from '../models/loginUserResponse.js';
import NameChangeRequest from '../models/nameChangeRequest.js';
import NameChangeResponse from '../models/nameChangeResponse.js';
import TransferRequest from '../models/transferRequest.js';
import TransferResponse from '../models/transferResponse.js';

export const ENDPOINT_KEY = {
  ADMIN_USER: 'ADMIN_USER',
  LOGIN: 'LOGIN',
  ACCOUNTS: 'ACCOUNTS',
  CHANGE_PROFILE: 'CHANGE_PROFILE',
  GET_PROFILE: 'GET_PROFILE',
  DEPOSIT: 'DEPOSIT',
  TRANSFER: 'TRANSFER',
  GET_ACCOUNTS: 'GET_ACCOUNTS',
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
  [ENDPOINT_KEY.CHANGE_PROFILE]: {
    url: '/customer/profile',
    method: 'put',
    requestModel: NameChangeRequest,
    responseModel: NameChangeResponse,
  },
  [ENDPOINT_KEY.GET_PROFILE]: {
    url: '/customer/profile',
    method: 'get',
    requestModel: BaseModel,
    responseModel: Customer,
  },
  [ENDPOINT_KEY.DEPOSIT]: {
    url: '/accounts/deposit',
    method: 'post',
    requestModel: DepositRequest,
    responseModel: DepositResponse,
  },
  [ENDPOINT_KEY.TRANSFER]: {
    url: '/accounts/transfer',
    method: 'post',
    requestModel: TransferRequest,
    responseModel: TransferResponse,
  },
  [ENDPOINT_KEY.GET_ACCOUNTS]: {
    url: '/customer/accounts',
    method: 'get',
    requestModel: BaseModel,
    responseModel: CustomerAccountsResponse,
  },
};

export default endpoints;
