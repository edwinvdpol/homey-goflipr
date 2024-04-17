'use strict';

const { OAuth2Driver } = require('homey-oauth2app');

class Driver extends OAuth2Driver {

  /*
  | Driver events
  */

  // Driver initialized
  async onOAuth2Init() {
    this.log('Initialized');
  }

  // Driver destroyed
  async onUninit() {
    this.log('Destroyed');
  }

  /*
  | Pairing functions
  */

  // Pair devices
  async onPairListDevices({ oAuth2Client }) {
    this.log(`Pairing ${this.id}s`);

    const devices = await oAuth2Client.discoverDevices(this.id);

    return Promise.all(devices.map((device) => this.getDeviceData(oAuth2Client, device)).filter((e) => e));
  }

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

module.exports = Driver;
