export default class Customer {
  constructor(id, username, password, name, role, accounts) {
    this.id = id;
    this.username = username;
    this.password = password;
    this.name = name;
    this.role = role;
    this.accounts = accounts;
  }

  static fromJson(json) {
    return new Customer(
      json.id,
      json.username,
      json.password,
      json.name,
      json.role,
      json.accounts || [],
    );
  }
}
