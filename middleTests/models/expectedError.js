export default class ExpectedError {
  constructor({ statusCode, errorMessage, errorKey }) {
    this.statusCode = statusCode;
    this.errorKey = errorKey;
    this.errorMessage = errorMessage;
  }
}
