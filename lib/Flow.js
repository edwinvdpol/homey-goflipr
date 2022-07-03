'use strict';

class Flow {

  // Constructor
  constructor({ homey }) {
    this.homey = homey;
  }

  // Register condition flow cards
  async register() {
    try {
      // ... and chlorine status is ...
      this.homey.flow.getConditionCard('status_ci').registerRunListener(async ({ device, status_ci }) => {
        return device.getCapabilityValue('status_ci') === status_ci;
      });

      // ... and pH status is ...
      this.homey.flow.getConditionCard('status_ph').registerRunListener(async ({ device, status_ph }) => {
        return device.getCapabilityValue('status_ph') === status_ph;
      });
    } catch (err) {
      this.homey.error(`Could not register flow cards: ${err.message}`);
    }
  }

}

module.exports = Flow;
