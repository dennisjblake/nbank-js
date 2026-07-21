import Customer from './Customer.js';

export default class NameChangeResponse {
  constructor(customer, message) {
    this.customer = customer;
    this.message = message;
  }

  static fromJson(json) {
    return new NameChangeResponse(
      Customer.fromJson(json.customer),
      json.message,
    );
  }
}
