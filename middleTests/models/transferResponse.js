import BaseModel from './baseModel.js';

export default class TransferResponse extends BaseModel {
  constructor({ senderAccountId, receiverAccountId, amount, message }) {
    super({ senderAccountId, receiverAccountId, amount, message });
  }
}
