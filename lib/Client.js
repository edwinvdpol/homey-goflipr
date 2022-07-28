'use strict';

const {OAuth2Client} = require('homey-oauth2app');
const {ModuleType} = require('./Enums');
const {filled} = require('./Utils');

class Client extends OAuth2Client {

  static API_URL = 'https://apis.goflipr.com';
  static TOKEN_URL = 'https://apis.goflipr.com/oauth2/token';
  static AUTHORIZATION_URL = 'https://apis.goflipr.com/accounts/form';
  static SCOPES = [''];

  /*
  | Client events
  */

  // Request response is not OK
  async onHandleNotOK({body, status, statusText, headers}) {
    this.error('Request not OK', JSON.stringify({
      body: body,
      status: status,
      statusText: statusText,
      headers: headers
    }));

    const error = filled(body.Message) ? body.Message : null;

    // Unauthorized
    if (status === 401) {
      return new Error(this.homey.__('errors.401'));
    }

    // Device / page not found
    if (status === 404) {
      return new Error(this.homey.__('errors.404'));
    }

    // API internal server error
    if (status >= 500 && status < 600) {
      return new Error(this.homey.__('errors.50x'));
    }

    // Custom error message
    if (error) {
      return new Error(error);
    }

    // Invalid response
    return new Error(this.homey.__('errors.response'));
  }

  // Handle result
  async onHandleResult({result, status, statusText, headers}) {
    if (filled(result) && typeof result === 'object') {
      return result;
    }

    this.error('Invalid API response:', result);

    throw new Error(this.homey.__('errors.response'));
  }

  // Client initialized
  async onInit() {
    // Register event listeners
    await this.registerEventListeners();

    this.log('Initialized');
  }

  // Request error
  async onRequestError({err}) {
    this.error('Request error:', err.message);

    throw new Error(this.homey.__('errors.50x'));
  }

  // Client destroyed
  async onUninit() {
    // Remove event listeners
    await this.removeEventListeners();

    this.log('Destroyed');
  }

  // Synchronize device
  async onSync(id) {
    try {
      const result = await this.getLastMeasures(id);

      this.homey.emit(`sync:${id}`, result);
    } catch (err) {
      this.homey.emit(`error:${id}`, err.message);
    }
  }

  /*
  | Client actions
  */

  // Fetch last measures for pool
  async getLastMeasures(id) {
    this.log(`Fetching last measures for ${id}`);

    const result = await this.get({
      path: `/modules/${id}/survey/last`,
      query: '',
      headers: {}
    });

    this.log(`Measures for ${id} response:`, JSON.stringify(result));

    return result;
  }

  // Fetch all modules
  async getModules() {
    this.log('Fetching all modules');

    const response = await this.get({
      path: '/modules',
      query: '',
      headers: {}
    });

    let result = {
      analysr: [],
      controlr: []
    }

    this.log('Modules response:', JSON.stringify(response));

    response.forEach(data => {
      if (data.ModuleType_Id === ModuleType.AnalysR) {
        result.analysr.push(data);
      }

      if (data.ModuleType_Id === ModuleType.ControlR) {
        result.controlr.push(data);
      }
    });

    return result;
  }

  // Fetch pool
  async getPool(id) {
    this.log(`Fetching pool ${id}`);

    const pool = await this.get({
      path: `/modules/${id}/pool`,
      query: '',
      headers: {}
    });

    this.log(`Pool ${id} response:`, JSON.stringify(pool));

    return pool;
  }

  /*
  | Listener functions
  */

  // Register event listeners
  async registerEventListeners() {
    if (this.homey.listenerCount('sync') > 0) {
      return;
    }

    this.onSyncDevice = this.onSync.bind(this);

    this.homey.on('sync', this.onSyncDevice);

    this.log('Event listeners registered');
  }

  // Remove event listeners
  async removeEventListeners() {
    if (this.homey.listenerCount('sync') <= 0) {
      return;
    }

    this.homey.off('sync', this.onSyncDevice);

    this.onSyncDevice = null;

    this.log('Event listeners removed');
  }
}

module.exports = Client;
