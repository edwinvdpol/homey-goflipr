'use strict';

class Flow {

  // Constructor
  constructor({homey}) {
    /*
    | Register condition flow cards
    */

    // ... and chlorine status is ...
    homey.flow.getConditionCard('status_ci').registerRunListener(async ({device, status_ci}) => {
      return device.getCapabilityValue('status_ci') === status_ci;
    });

    // ... and pH status is ...
    homey.flow.getConditionCard('status_ph').registerRunListener(async ({device, status_ph}) => {
      return device.getCapabilityValue('status_ph') === status_ph;
    });
  }

}

module.exports = Flow;
