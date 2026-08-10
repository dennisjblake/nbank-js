import BaseModel from './baseModel.js';

export default class NameChangeRequest extends BaseModel {
  constructor({ name }) {
    super({ name });
  }
}
