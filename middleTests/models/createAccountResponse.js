export default class CreateAccountResponse {
  constructor(accountNumber, balance, id, transactions) {
    this.accountNumber = accountNumber;
    this.balance = balance;
    this.id = id;
    this.transactions = transactions;
  }

  static fromJson(json) {
    return new CreateAccountResponse(
      json.accountNumber,
      json.balance,
      json.id,
      json.transactions || [],
    );
  }
}
