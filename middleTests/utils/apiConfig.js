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
        Authorization: `Basic ${process.env.ADMIN_AUTH_TOKEN}`,
      },
    };
  }

  static getUserAuth(token) {
    return {
      headers: {
        ...this.#defaultHeaders,
        Authorization: `${token}`,
      },
    };
  }
}
