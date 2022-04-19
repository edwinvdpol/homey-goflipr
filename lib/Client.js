'use strict';

const {OAuth2Client} = require('homey-oauth2app');
const {ModuleType} = require('./Enums');

class Client extends OAuth2Client {

  static API_URL = 'https://apis.goflipr.com';
  static TOKEN_URL = 'https://apis.goflipr.com/oauth2/token';
  static AUTHORIZATION_URL = 'https://apis.goflipr.com/accounts/form';
  static SCOPES = [''];

  /*
  |-----------------------------------------------------------------------------
  | Client events
  |-----------------------------------------------------------------------------
  */

  // Initialized
  async onInit() {
    this.log('Client initialized');
  }

  // Uninitialized
  async onUninit() {
    this.log('Client uninitialized');
  }

  // Request response is not OK
  async onHandleNotOK({body, status, statusText, headers}) {
    this.error('Request not OK', JSON.stringify({
      body: body,
      status: status,
      statusText: statusText,
      headers: headers
    }));

    if (body.hasOwnProperty('Message')) {
      return new Error(body.Message);
    }

    switch (status) {
      case 401:
        return new Error(this.homey.__('errors.401'));
      case 404:
        return new Error(this.homey.__('errors.404'));
      default:
        return new Error(this.homey.__('errors.50x'));
    }
  }

  // Handle result
  async onHandleResult({result, status, statusText, headers}) {
    if (typeof result !== 'object') {
      this.error('Invalid response result:', result);

      this.homey.emit('flipr:error', this.homey.__('errors.response'));

      throw new Error(this.homey.__('error.response'));
    }

    return result;
  }

  // Request error
  async onRequestError({err}) {
    this.error('Request error:', err.message);

    this.homey.emit('flipr:error', this.homey.__('errors.50x'));

    throw new Error(this.homey.__('error.50x'));
  }

  /*
  |-----------------------------------------------------------------------------
  | Client actions
  |-----------------------------------------------------------------------------
  */

  // Fetch last measures for pool
  async getLastMeasures(fliprId) {
    this.log('Fetching last measures for pool');

    const measures = await this.get({
      path: `/modules/${fliprId}/survey/last`,
      query: '',
      headers: {}
    });

    this.log('Measures response:', JSON.stringify(measures));

    return measures;
  }

  // Fetch all modules
  async getModules() {
    this.log('Fetching all modules');

    let modules = {
      analysr: [],
      controlr: []
    }

    const response = await this.get({
      path: '/modules',
      query: '',
      headers: {}
    });

    this.log('Modules response:', JSON.stringify(response));

    response.forEach(data => {
      if (data.ModuleType_Id === ModuleType.AnalysR) {
        modules.analysr.push(data);
      }

      if (data.ModuleType_Id === ModuleType.ControlR) {
        modules.controlr.push(data);
      }
    });

    return modules;
  }

  // Get pool details
  async getPool(fliprId) {
    this.log(`Fetching pool ${fliprId}`);

    const pool = await this.get({
      path: `/modules/${fliprId}/pool`,
      query: '',
      headers: {}
    });

    this.log(`Pool ${fliprId} response:`, JSON.stringify(pool));

    return pool;
  }

}

module.exports = Client;
