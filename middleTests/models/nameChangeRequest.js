export default class NameChangeRequest {
  constructor(name) {
    this.name = name;
  }
  static toJson() {
    return {
      name: this.name,
    };
  }
}
