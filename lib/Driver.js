'use strict';

const { OAuth2Driver } = require('homey-oauth2app');

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
    this.homey.flow.getConditionCard('status_ci').registerRunListener(async ({ device, statusCi }) => {
      return device.getCapabilityValue('status_ci') === statusCi;
    });

    // ... and pH status is ...
    this.homey.flow.getConditionCard('status_ph').registerRunListener(async ({ device, statusPh }) => {
      return device.getCapabilityValue('status_ph') === statusPh;
    });
  }

}

module.exports = Driver;
