export default class CustomerAccountsResponse {
  constructor(id, accountNumber, balance, transactions) {
    this.id = id;
    this.accountNumber = accountNumber;
    this.balance = balance;
    this.transactions = transactions;
  }

  static fromJson(json) {
    return new CustomerAccountsResponse(
      json.id,
      json.accountNumber,
      json.balance,
      json.transactions || [],
    );
  }
}
