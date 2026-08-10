import BaseModel from './baseModel.js';

export default class Customer extends BaseModel {
  constructor({ id, username, password, name, role, accounts }) {
    super({ id, username, password, name, role, accounts });
  }
}
