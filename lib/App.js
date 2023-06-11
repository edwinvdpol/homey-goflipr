/* eslint-disable camelcase */

'use strict';

const { OAuth2App } = require('homey-oauth2app');
const { Log } = require('homey-log');
const Client = require('./Client');

class App extends OAuth2App {

  static OAUTH2_CLIENT = Client;

  /*
  | Application events
  */

  // Application initialized
  async onOAuth2Init() {
    // Sentry logging
    this.homeyLog = new Log({ homey: this.homey });

    // Register flow cards
    this.registerFlowCards();

    this.log('Initialized');
  }

  /*
  | Support functions
  */

  // Register flow cards
  registerFlowCards() {
    this.log('Registering flow cards...');

    // Condition flow cards
    // ... and chlorine status is ...
    this.homey.flow.getConditionCard('status_ci').registerRunListener(async ({ device, status_ci }) => {
      return device.getCapabilityValue('status_ci') === status_ci;
    });

    // ... and pH status is ...
    this.homey.flow.getConditionCard('status_ph').registerRunListener(async ({ device, status_ph }) => {
      return device.getCapabilityValue('status_ph') === status_ph;
    });

    this.log('Flow cards registered');
  }

}

module.exports = App;
