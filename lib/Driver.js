'use strict';

const {OAuth2Driver} = require('homey-oauth2app');

class Driver extends OAuth2Driver {

  // Driver initialized
  async onOAuth2Init() {
    // Register flow cards
    this.registerConditionFlowCards();

    this.log('Initialized');
  }

  /*
  | Register flow cards functions
  */

  // Register condition flow cards
  registerConditionFlowCards() {
    // ... and chlorine status is ...
    this.homey.flow.getConditionCard('status_ci').registerRunListener(async ({device, status_ci}) => {
      return device.getCapabilityValue('status_ci') === status_ci;
    });

    // ... and pH status is ...
    this.homey.flow.getConditionCard('status_ph').registerRunListener(async ({device, status_ph}) => {
      return device.getCapabilityValue('status_ph') === status_ph;
    });
  }

}

module.exports = Driver;
