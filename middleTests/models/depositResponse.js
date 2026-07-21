export default class DepositResponse {
  constructor(id, accountNumber, balance, transactions) {
    this.id = id;
    this.accountNumber = accountNumber;
    this.balance = balance;
    this.transactions = transactions;
  }

  static fromJson(json) {
    return new DepositResponse(
      json.id,
      json.accountNumber,
      json.balance,
      json.transactions || [],
    );
  }
}
