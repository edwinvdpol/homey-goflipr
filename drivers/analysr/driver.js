'use strict';

const Driver = require('../../lib/Driver');
const {blank} = require('../../lib/Utils');

class AnalysrDriver extends Driver {

  // Pair devices
  async onPairListDevices({oAuth2Client}) {
    this.log('Listing devices');

    const modules = await oAuth2Client.getModules();

    let devices = [];

    // No devices found
    if (blank(modules.analysr)) {
      return devices;
    }

    for (const module of modules.analysr) {
      const pool = await oAuth2Client.getPool(module.Serial);

      devices.push(this.getDeviceData(module, pool));
    }

    return devices;
  }

  // Return data to create the device
  getDeviceData(module, pool) {
    return {
      name: `${pool.Type.Name} (${module.Serial})`,
      data: {
        id: module.Serial
      },
      settings: {
        serial_number: module.Serial,
        version: String(module.Version),
        volume: String(pool.Volume) + ' m³',
        construction_year: String(pool.BuiltYear)
      }
    }
  }

}

module.exports = AnalysrDriver;
