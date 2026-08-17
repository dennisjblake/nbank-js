import BaseModel from './baseModel.js';

export default class TransferRequest extends BaseModel {
  constructor({ senderAccountId, receiverAccountId, amount }) {
    super({ senderAccountId, receiverAccountId, amount });
  }
}
