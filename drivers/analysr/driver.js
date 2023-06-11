'use strict';

const Driver = require('../../lib/Driver');

class AnalysrDriver extends Driver {

  // Return data to create the device
  async getDeviceData(client, device) {
    this.log(`Get device ${device.Serial} from API`);

    let pool = await client.getDevice(device.Serial);

    const data = {
      name: `${pool.Type.Name} (${device.Serial})`,
      data: {
        id: device.Serial,
      },
      settings: {
        serial_number: device.Serial,
        version: `${device.Version}`,
        volume: `${pool.Volume} m³`,
        construction_year: `${pool.BuiltYear}`,
      },
    };

    pool = null;

    this.log('Device found', JSON.stringify(data));

    return data;
  }

}

module.exports = AnalysrDriver;
