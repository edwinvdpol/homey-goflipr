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
      this.log('[Response]', JSON.stringify(result));

      return result;
    }

    this.error('[Response]', result);

    throw new Error(this.homey.__('errors.50x'));
  }

  // Request error
  async onRequestError({ err }) {
    this.error('[Request]', err.toString());

    throw new Error(this.homey.__('errors.network'));
  }

}

module.exports = Client;
