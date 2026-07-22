export default class TransferRequest {
  constructor(senderAccountId, receiverAccountId, amount) {
    this.senderAccountId = senderAccountId;
    this.receiverAccountId = receiverAccountId;
    this.amount = amount;
  }
  toJson(){
    return{
        senderAccountId: this.senderAccountId,
        receiverAccountId: this.receiverAccountId,
        amount: this.amount
    };
  }
}
