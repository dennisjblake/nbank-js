import BaseModel from './baseModel.js';

export default class CreateUserResponse extends BaseModel {
  constructor({ id, username, paswword, name = '', role, accounts = [] }) {
    super({ id, username, paswword, name, role, accounts });
  }
}
