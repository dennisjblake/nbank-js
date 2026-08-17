import BaseModel from './baseModel.js';

export default class LoginUserResponse extends BaseModel {
  constructor({ username, role }) {
    super({ username, role });
  }
}
