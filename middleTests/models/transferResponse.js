export default class TransferResponse {
  constructor(senderAccountId, receiverAccountId, amount, message) {
    this.senderAccountId = senderAccountId;
    this.receiverAccountId = receiverAccountId;
    this.amount = amount;
    this.message = message;
  }

  static fromJson(json) {
    return new TransferResponse(
      json.senderAccountId,
      json.receiverAccountId,
      json.amount,
      json.message,
    );
  }
}
