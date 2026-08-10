import BaseModel from './baseModel.js';
import Customer from './Customer.js';

export default class NameChangeResponse extends BaseModel {
  constructor({ customer, message }) {
    super({ customer, message });
  }
}
