import BaseModel from './baseModel.js';

export default class TransactionResponse extends BaseModel {
  constructor({ id, amount, type, timestamp, relatedAccountId }) {
    super({ id, amount, type, timestamp, relatedAccountId });
  }
}
