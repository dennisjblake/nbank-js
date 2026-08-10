import axios from 'axios';
import { config } from 'dotenv';

config({ quiet: true });

const backEndUrl = process.env.BACKEND_URL;

export default class HttpClient {
  constructor() {
    this.client = axios.create({
      baseURL: backEndUrl,
    });
  }

  async get(url, config = {}) {
    try {
      return this.client.get(url, config);
    } catch (error) {
      if (error.response) {
        throw new Error(
          `Request failed with status code: ${error.response.status}`,
        );
      }
      throw error;
    }
  }

  async post(url, data, config) {
    try {
      return this.client.post(url, data, config);
    } catch (error) {
      if (error.response) {
        throw new Error(
          `Request failed with status code: ${error.response.status}`,
        );
      }
      throw error;
    }
  }

  async put(url, data, config) {
    try {
      return this.client.put(url, data, config);
    } catch (error) {
      if (error.response) {
        throw {
          message: `Request failed with status code: ${error.response.status}`,
          response: error.response,
        };
      }
      throw error;
    }
  }
}
