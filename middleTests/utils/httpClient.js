import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const backEndUrl = process.env.BACKEND_URL;

export default class HttpClient {
  constructor() {
    this.client = axios.create({
      baseURL: backEndUrl,
    });
  }

  async get(url, config = {}) {
    return this.client.get(url, config);
  }

  async post(url, data, config) {
    return this.client.post(url, data, config);
  }

  async put(url, data, config) {
    return this.client.put(url, data, config);
  }
}
