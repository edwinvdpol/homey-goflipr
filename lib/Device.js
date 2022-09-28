'use strict';

const { OAuth2Device } = require('homey-oauth2app');

class Device extends OAuth2Device {

  /*
  | Device events
  */

  // Device deleted
  async onOAuth2Deleted() {
    // Stop timer
    this.stopTimer().catch(this.error);

    this.log('Deleted');
  }

  // Device initialized
  async onOAuth2Init() {
    // Wait for driver to become ready
    await this.driver.ready();

    // Start timer
    await this.startTimer();

    this.log('Initialized');

    // Synchronize device
    await this.sync();
  }

  // Device destroyed
  async onOAuth2Uninit() {
    // Stop timer
    this.stopTimer().catch(this.error);

    this.log('Destroyed');
  }

  /*
  | Synchronization functions
  */

  async sync() {
    try {
      const { id } = this.getData();
      const result = await this.oAuth2Client.getLastMeasures(id);

      await this.handleSyncData(result);
    } catch (err) {
      this.error(err.message);
      this.setUnavailable(err.message).catch(this.error);
    }
  }

  /*
  | Timer functions
  */

  // Start timer
  async startTimer(minutes = null) {
    if (this.timer) {
      return;
    }

    if (!minutes) {
      minutes = 15;
    }

    this.timer = this.homey.setInterval(this.sync.bind(this), (1000 * 60 * minutes));

    this.log(`Timer started with ${minutes} minutes`);
  }

  // Stop timer
  async stopTimer() {
    if (!this.timer) {
      return;
    }

    this.homey.clearTimeout(this.timer);
    this.timer = null;

    this.log('Timer stopped');
  }

}

module.exports = Device;
