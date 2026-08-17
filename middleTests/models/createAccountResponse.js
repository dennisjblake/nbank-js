import BaseModel from './baseModel.js';

export default class CreateAccountResponse extends BaseModel {
  constructor({ accountNumber, balance, id, transactions }) {
    super({ accountNumber, balance, id, transactions });
  }
}
