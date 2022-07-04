'use strict';

const {OAuth2Device} = require("homey-oauth2app");

class AnalysrDevice extends OAuth2Device {

  /*
  |-----------------------------------------------------------------------------
  | Device events
  |-----------------------------------------------------------------------------
  */

  // Device added
  async onOAuth2Added() {
    this.log('Device added (oAuth2)');
  }

  // Device deleted
  async onOAuth2Deleted() {
    this.log('Device deleted (oAuth2)');

    this.cleanup().catch(this.error);

    await this.homey.app.stopTimer();
  }

  // OAuth2 session is revoked
  async onOAuth2Destroyed() {
    this.error('Login session destroyed (oAuth2)');

    this.setUnavailable(this.homey.__('error.revoked')).catch(this.error);

    this.cleanup().catch(this.error);
  }

  // OAuth2 session is expired
  async onOAuth2Expired() {
    this.error('Login session expired (oAuth2)');

    this.setUnavailable(this.homey.__('error.expired')).catch(this.error);

    this.cleanup().catch(this.error);
  }

  // Device initialized
  async onOAuth2Init() {
    this.log('Device initialized (oAuth2)');

    this.setUnavailable().catch(this.error);

    // Wait for driver to become ready
    await this.driver.ready();

    // Register listeners
    await this.registerEventListeners();

    // Start refresh timer
    await this.homey.app.startTimer();

    // Sync device data
    this.syncDeviceData();
  }

  /*
  |-----------------------------------------------------------------------------
  | Support functions
  |-----------------------------------------------------------------------------
  */

  // Cleanup device data / listeners
  async cleanup() {
    this.log('Cleanup device data');

    // Remove event listeners for device
    this.homey.off('flipr:error', this.onError);
    this.homey.off('flipr:sync', this.onSync);
  }

  // Register event listeners
  async registerEventListeners() {
    this.onSync = this.syncDeviceData.bind(this);
    this.onError = this.setUnavailable.bind(this);

    this.homey.on('flipr:error', this.onError);
    this.homey.on('flipr:sync', this.onSync);
  }

  /*
  |-----------------------------------------------------------------------------
  | Device update commands
  |-----------------------------------------------------------------------------
  */

  // Synchronize device data
  syncDeviceData() {
    Promise.resolve().then(async () => {
      await this.updateMeasures();
      await this.setAvailable();
    }).catch(err => {
      this.error('Update failed', err);
      this.setUnavailable(err.message).catch(this.error);
    });
  }

  // Update measures
  async updateMeasures() {
    const {id} = this.getData();
    const measure = await this.oAuth2Client.getLastMeasures(id);

    if (measure.hasOwnProperty('Temperature')) {
        this.setCapabilityValue('measure_temperature', measure.Temperature).catch(this.error);
    }

    if (measure.hasOwnProperty('Desinfectant')) {
      const ci = measure.Desinfectant;

      if (ci.hasOwnProperty('Value')) {
        this.setCapabilityValue('measure_ci', ci.Value).catch(this.error);
      }

      if (ci.hasOwnProperty('DeviationSector')) {
        this.setCapabilityValue('status_ci', ci.DeviationSector).catch(this.error);
      }
    }

    if (measure.hasOwnProperty('PH')) {
      const ph = measure.PH;

      if (ph.hasOwnProperty('Value')) {
        this.setCapabilityValue('measure_ph', ph.Value).catch(this.error);
      }

      if (ph.hasOwnProperty('DeviationSector')) {
        this.setCapabilityValue('status_ph', ph.DeviationSector).catch(this.error);
      }
    }

    if (measure.hasOwnProperty('OxydoReductionPotentiel')) {
      const orp = measure.OxydoReductionPotentiel;

      if (orp.hasOwnProperty('Value')) {
        this.setCapabilityValue('measure_orp', orp.Value).catch(this.error);
      }
    }
  }

}

module.exports = AnalysrDevice;
