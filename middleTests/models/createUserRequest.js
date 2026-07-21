export default class CreateUserRequest {
  constructor(username, password, role = 'USER') {
    this.username = username;
    this.password = password;
    this.role = role;
  }

  static generateUserData(role = 'USER') {
    const username = CreateUserRequest.generateUsername();
    const password = CreateUserRequest.generatePassword();
    return new CreateUserRequest(username, password, role);
  }

  static generateUsername(length = 10) {
    const allowedChars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_.';
    let username = '';
    for (let i = 0; i < length; i++) {
      username += allowedChars.charAt(
        Math.floor(Math.random() * allowedChars.length),
      );
    }
    return username;
  }

  static generatePassword(length = 12) {
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lower = 'abcdefghijklmnopqrstuvwxyz';
    const digits = '0123456789';
    const specials = '!@#';
    const all = lower + upper + digits + specials;
    let password = [
      lower[Math.floor(Math.random() * lower.length)],
      upper[Math.floor(Math.random() * upper.length)],
      digits[Math.floor(Math.random() * digits.length)],
      specials[Math.floor(Math.random() * specials.length)],
    ];

    for (let i = password.length; i < length; i++) {
      password.push(all[Math.floor(Math.random() * all.length)]);
    }

    return password.sort(() => Math.random() - 0.5).join('');
  }
}
