'use strict';

const { OAuth2Client } = require('homey-oauth2app');
const { blank, filled } = require('./Utils');
const { ModuleType } = require('./Enums');

class Client extends OAuth2Client {

  static API_URL = 'https://apis.goflipr.com';
  static TOKEN_URL = 'https://apis.goflipr.com/oauth2/token';
  static SCOPES = [''];

  /*
  | Device discovery functions
  */

  // Discover devices of given type
  async discoverDevices(type) {
    const devices = await this._get('/modules');

    // Empty response
    if (blank(devices)) {
      return [];
    }

    // Return only AnalysR devices
    if (type === 'analysr') {
      return devices.filter((device) => device.ModuleType_Id === ModuleType.AnalysR);
    }

    return [];
  }

  /*
  | Device functions
  */

  // Return single device
  async getDevice(id) {
    return this._get(`/modules/${id}/pool`);
  }

  // Return last measures for device
  async getLastMeasures(id) {
    return this._get(`/modules/${id}/survey/last`);
  }

  /*
  | Support functions
  */

  // Perform GET request
  async _get(path) {
    path += '?l=en';

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

  // Client initialized
  async onInit() {
    this.log('Initialized');
  }

  // Client destroyed
  async onUninit() {
    this.log('Destroyed');
  }

  // Invalid token response
  async onHandleGetTokenByCredentialsError({ response }) {
    throw await this.onHandleNotOK(response);
  }

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

    let error;

    // Client errors
    if (status === 401 || status === 403 || status === 404) {
      error = new Error(this.homey.__(`error.${status}`));
    }

    // Internal server error
    if (status >= 500 && status < 600) {
      error = new Error(this.homey.__('error.50x'));
    }

    // Custom error message
    if (filled(body.Message)) {
      error = new Error(body.Message);
    }

    // Unknown error
    if (blank(error)) {
      error = new Error(this.homey.__('error.unknown'));
    }

    error.status = status;
    error.statusText = statusText;

    return error;
  }

  // Handle result
  async onHandleResult({
    result, status, statusText, headers,
  }) {
    if (filled(result) && typeof result === 'object') {
      this.log('[Response]', JSON.stringify(result));

      return result;
    }

    this.error('[Response]', result);

    throw new Error(this.homey.__('error.50x'));
  }

  // Request error
  async onRequestError({ err }) {
    this.error('[Request]', err.message);

    throw new Error(this.homey.__('error.network'));
  }

}

module.exports = Client;
