import BaseModel from './baseModel.js';

export default class CustomerAccountsResponse extends BaseModel {
  constructor({ id, accountNumber, balance, transactions }) {
    super({ id, accountNumber, balance, transactions });
  }
}
