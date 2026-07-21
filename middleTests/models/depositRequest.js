export default class DepositRequest {
  constructor(id, balance) {
    this.id = id;
    this.balance = balance;
  }
  toJson() {
    return {
      id: this.id,
      balance: this.balance,
    };
  }
}
