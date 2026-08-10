import BaseModel from './baseModel.js';

export default class DepositRequest extends BaseModel {
  constructor({ id, balance }) {
    super({ id, balance });
  }
}
