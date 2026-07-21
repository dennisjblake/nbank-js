export default class TransactionResponse {
  constructor(id, amount, type, timestamp, relatedAccountId) {
    this.id = id;
    this.amount = amount;
    this.type = type;
    this.timestamp = timestamp;
    this.relatedAccountId = relatedAccountId;
  }

  static fromJson(json) {
    return new TransactionResponse(
      json.id,
      json.amount,
      json.type,
      json.timestamp,
      json.relatedAccountId,
    );
  }
}
