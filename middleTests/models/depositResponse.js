import BaseModel from './baseModel.js';

export default class DepositResponse extends BaseModel {
  constructor({ id, accountNumber, balance, transactions }) {
    super({ id, accountNumber, balance, transactions });
  }
}
