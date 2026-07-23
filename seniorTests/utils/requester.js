import HttpClient from './httpClient.js';
import endpoints from './endpoints.js';
import { config } from 'dotenv';

export default class Requester {
  constructor() {
    this.httpClient = new HttpClient();
  }

  async request(endpointKey, { data = null, config = {} } = {}) {
    const endpoint = endpoints[endpointKey];
    if (!endpoint) {
      throw new Error(`Endpoint ${endpointKey} not found`);
    }

    const { url, method = 'post', responseModel } = endpoint;
    const requestData = data?.toJson ? data.toJson() : data;
    const httpMethod = method.toLowerCase();

    try {
      let response;
      if (httpMethod == 'get') {
        response = await this.httpClient.get(url, {
          params: requestData,
          ...config,
        });
      } else {
        response = await this.httpClient[httpMethod](url, requestData, config);
      }

      const responseData = responseModel
        ? this.#instantiateModel(responseModel, response.data)
        : response.data;

      return {
        data: responseData,
        status: response.status,
        headers: response.headers,
      };
    } catch (error) {
      throw error;
    }
  }

  #instantiateModel(ModelClass, data) {
    if (typeof ModelClass.fromJson === 'function') {
      return ModelClass.fromJson(data);
    }
    return new ModelClass(data);
  }
}
