export default class LoginUserRequest {
  constructor(username, password) {
    this.username = username;
    this.password = password;
  }

  static toJson() {
    return {
      username: this.username,
      password: this.password,
    };
  }
}
