'use strict';

const Device = require('../../lib/Device');
const { blank } = require('../../lib/Utils');

class AnalysrDevice extends Device {

  /*
  | Synchronization functions
  */

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

}

module.exports = AnalysrDevice;
