import BaseModel from './baseModel.js';

export default class LoginUserRequest extends BaseModel {
  constructor({ username, password }) {
    super({ username, password });
  }
}
