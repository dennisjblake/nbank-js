export default class LoginUserResponse {
  constructor(username, role) {
    this.username = username;
    this.role = role;
  }

  static fromJson(json) {
    return new LoginUserResponse(json.username, json.role);
  }
}
