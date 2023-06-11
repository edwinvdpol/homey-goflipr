'use strict';

const { OAuth2Client } = require('homey-oauth2app');
const { blank, filled } = require('./Utils');
const { ModuleType } = require('./Enums');

class Client extends OAuth2Client {

  static API_URL = 'https://apis.goflipr.com';
  static TOKEN_URL = 'https://apis.goflipr.com/oauth2/token';
  static AUTHORIZATION_URL = 'https://apis.goflipr.com/accounts/form';
  static SCOPES = [''];

  /*
  | Device discovery functions
  */

  // Discover devices of given type
  async discoverDevices(type) {
    const path = '/modules';

    this.log('GET', path);

    const response = await this.get({
      path,
      query: '',
      headers: {},
    });

    // Empty response
    if (blank(response)) {
      return [];
    }

    // Return only AnalysR devices
    if (type === 'analysr') {
      return response.filter((device) => device.ModuleType_Id === ModuleType.AnalysR);
    }

    return [];
  }

  /*
  | Device functions
  */

  // Return single device
  async getDevice(id) {
    const path = `/modules/${id}/pool`;

    this.log('GET', path);

    return this.get({
      path,
      query: '',
      headers: {},
    });
  }

  // Return last measures for device
  async getLastMeasures(id) {
    const path = `/modules/${id}/survey/last`;

    this.log('GET', path);

    return this.get({
      path,
      query: '',
      headers: {},
    });
  }

  /*
  | Client events
  */

  // Request response is not OK
  async onHandleNotOK({
    body, status, statusText, headers,
  }) {
    this.error('Request not OK', JSON.stringify({
      body,
      status,
      statusText,
      headers,
    }));

    const error = filled(body.Message) ? body.Message : null;

    // Client errors
    if (status === 401 || status === 403 || status === 404) {
      return new Error(this.homey.__(`errors.${status}`));
    }

    // Internal server error
    if (status >= 500 && status < 600) {
      return new Error(this.homey.__('errors.50x'));
    }

    // Custom error message
    if (error) {
      return new Error(error);
    }

    // Unknown error
    return new Error(this.homey.__('errors.unknown'));
  }

  // Handle result
  async onHandleResult({
    result, status, statusText, headers,
  }) {
    if (filled(result) && typeof result === 'object') {
      this.log('Response', JSON.stringify(result));

      return result;
    }

    this.error('Invalid response', result);

    throw new Error(this.homey.__('errors.50x'));
  }

  // Request error
  async onRequestError({ err }) {
    this.error('Request error', err.message);

    throw new Error(this.homey.__('errors.network'));
  }

}

module.exports = Client;
