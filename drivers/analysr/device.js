'use strict';

const Device = require('../../lib/Device');
const { filled } = require('../../lib/Utils');

class AnalysrDevice extends Device {

  // Set device data
  handleSyncData(data) {
    this.log('Update device', JSON.stringify(data));

    if (filled(data.Temperature)) {
      this.setCapabilityValue('measure_temperature', data.Temperature).catch(this.error);
    }

    if (filled(data.Desinfectant)) {
      if (filled(data.Desinfectant.Value)) {
        this.setCapabilityValue('measure_ci', data.Desinfectant.Value).catch(this.error);
      }

      if (filled(data.Desinfectant.DeviationSector)) {
        this.setCapabilityValue('status_ci', data.Desinfectant.DeviationSector).catch(this.error);
      }
    }

    if (filled(data.PH)) {
      if (filled(data.PH.Value)) {
        this.setCapabilityValue('measure_ph', data.PH.Value).catch(this.error);
      }

      if (filled(data.PH.DeviationSector)) {
        this.setCapabilityValue('status_ph', data.PH.DeviationSector).catch(this.error);
      }
    }

    if (filled(data.OxydoReductionPotentiel)) {
      if (filled(data.OxydoReductionPotentiel.Value)) {
        this.setCapabilityValue('measure_orp', data.OxydoReductionPotentiel.Value).catch(this.error);
      }
    }

    this.setAvailable().catch(this.error);
  }

}

module.exports = AnalysrDevice;
