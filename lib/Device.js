'use strict';

const { OAuth2Device } = require('homey-oauth2app');
const { blank } = require('./Utils');

class Device extends OAuth2Device {

  static SYNC_INTERVAL = 15; // Minutes

  /*
  | Device events
  */

  // Device added
  async onOAuth2Added() {
    this.log('Added');
  }

  // Device deleted
  async onOAuth2Deleted() {
    this.log('Deleted');
  }

  // Device initialized
  async onOAuth2Init() {
    // Connecting to API
    await this.setUnavailable(this.homey.__('authentication.connecting'));

    // Register timer
    this.registerTimer();

    // Synchronize device
    await this.sync();

    this.log('Initialized');
  }

  // Device destroyed
  async onOAuth2Uninit() {
    // Unregister timer
    this.unregisterTimer();

    this.log('Destroyed');
  }

  /*
  | Synchronization functions
  */

  // Synchronize
  async sync() {
    let result;

    try {
      this.log('[Sync] Get last measures from API');

      const { id } = this.getData();
      result = await this.oAuth2Client.getLastMeasures(id);

      await this.handleSyncData(result);

      this.setAvailable().catch(this.error);
    } catch (err) {
      this.error('[Sync]', err.toString());
      this.setUnavailable(err.message).catch(this.error);
    } finally {
      result = null;
    }
  }

  // Handle sync data
  async handleSyncData(data) {
    if (blank(data)) return;

    this.log('[Sync]', JSON.stringify(data));

    // Temperature
    if ('Temperature' in data) {
      this.setCapabilityValue('measure_temperature', data.Temperature).catch(this.error);
    }

    // Desinfectant
    if ('Desinfectant' in data) {
      if ('Value' in data.Desinfectant) {
        this.setCapabilityValue('measure_ci', data.Desinfectant.Value).catch(this.error);
      }

      if ('DeviationSector' in data.Desinfectant) {
        this.setCapabilityValue('status_ci', data.Desinfectant.DeviationSector).catch(this.error);
      }
    }

    // PH value
    if ('PH' in data) {
      if ('Value' in data.PH) {
        this.setCapabilityValue('measure_ph', data.PH.Value).catch(this.error);
      }

      if ('DeviationSector' in data.PH) {
        this.setCapabilityValue('status_ph', data.PH.DeviationSector).catch(this.error);
      }
    }

    // Oxydo reduction potentiel
    if ('OxydoReductionPotentiel' in data) {
      if ('Value' in data.OxydoReductionPotentiel) {
        this.setCapabilityValue('measure_orp', data.OxydoReductionPotentiel.Value).catch(this.error);
      }
    }
  }

  /*
  | Timer functions
  */

  // Register timer
  registerTimer() {
    if (this.syncDeviceTimer) return;

    const interval = 1000 * 60 * this.constructor.SYNC_INTERVAL;

    this.syncDeviceTimer = this.homey.setInterval(this.sync.bind(this), interval);

    this.log('[Timer] Registered');
  }

  // Unregister timer
  unregisterTimer() {
    if (!this.syncDeviceTimer) return;

    this.homey.clearInterval(this.syncDeviceTimer);

    this.syncDeviceTimer = null;

    this.log('[Timer] Unregistered');
  }

}

module.exports = Device;
