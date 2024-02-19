'use strict';

const Device = require('../../lib/Device');
const { blank, filled } = require('../../lib/Utils');

class AnalysrDevice extends Device {

  /*
  | Synchronization functions
  */

  // Handle sync data
  async handleSyncData(data) {
    if (blank(data)) return;

    this.log('[Sync]', JSON.stringify(data));

    // Temperature
    if (filled(data.Temperature)) {
      this.setCapabilityValue('measure_temperature', data.Temperature).catch(this.error);
    }

    // Desinfectant
    if (filled(data.Desinfectant)) {
      if (filled(data.Desinfectant.Value)) {
        this.setCapabilityValue('measure_ci', data.Desinfectant.Value).catch(this.error);
      }

      if (filled(data.Desinfectant.DeviationSector)) {
        this.setCapabilityValue('status_ci', data.Desinfectant.DeviationSector).catch(this.error);
      }
    }

    // PH value
    if (filled(data.PH)) {
      if (filled(data.PH.Value)) {
        this.setCapabilityValue('measure_ph', data.PH.Value).catch(this.error);
      }

      if (filled(data.PH.DeviationSector)) {
        this.setCapabilityValue('status_ph', data.PH.DeviationSector).catch(this.error);
      }
    }

    // Oxydo reduction potentiel
    if (filled(data.OxydoReductionPotentiel)) {
      if (filled(data.OxydoReductionPotentiel.Value)) {
        this.setCapabilityValue('measure_orp', data.OxydoReductionPotentiel.Value).catch(this.error);
      }
    }
  }

}

module.exports = AnalysrDevice;
