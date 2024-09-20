'use strict';

const { OAuth2Client } = require('homey-oauth2app');
const { filled } = require('./Utils');
const { ModuleType } = require('./Enums');
const Pool = require('../models/Pool');
const Survey = require('../models/Survey');

class Client extends OAuth2Client {

  static API_URL = 'https://apis.goflipr.com';
  static TOKEN_URL = 'https://apis.goflipr.com/oauth2/token';
  static AUTHORIZATION_URL = 'https://apis.goflipr.com/accounts/form';
  static SCOPES = [''];

  /*
  | Device discovery functions
  */

  // Discover devices
  async discoverDevices() {
    const devices = await this.getDevices();

    const pools = await Promise.all(devices.map(async (device) => this.getDevice(device)));

    return pools
      .map((device) => device.data)
      .filter((e) => e);
  }

  /*
  | Device functions
  */

  // Return all devices
  async getDevices() {
    const devices = await this._get('/modules');

    return devices.filter((device) => device.ModuleType_Id === ModuleType.AnalysR);
  }

  // Return single device
  async getDevice(device) {
    let data = {};

    const serial = device.Serial;
    const pool = await this._get(`/modules/${serial}/pool`);

    if (filled(pool)) {
      data = { ...device, ...pool };
    }

    return new Pool(data);
  }

  // Return last survey for device
  async getLastSurvey(id) {
    const data = await this._get(`/modules/${id}/survey/last`);

    return new Survey(data);
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
      return new Error(this.homey.__(`error.${status}`));
    }

    // Internal server error
    if (status >= 500 && status < 600) {
      return new Error(this.homey.__('error.50x'));
    }

    // Custom error message
    if (error) {
      return new Error(error);
    }

    // Unknown error
    return new Error(this.homey.__('error.unknown'));
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
    this.error('[Request]', err.toString());

    throw new Error(this.homey.__('error.network'));
  }

}

module.exports = Client;
