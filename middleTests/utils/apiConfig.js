export default class ApiConfig {
  static #defaultHeaders = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  static get unauth() {
    return {
      headers: this.#defaultHeaders,
    };
  }
  static get adminAuth() {
    return {
      headers: {
        ...this.#defaultHeaders,
        Authorization: process.env.ADMIN_AUTH_TOKEN,
      },
    };
  }
}
