'use strict';

const {OAuth2Driver} = require('homey-oauth2app');

class Driver extends OAuth2Driver {

  // Driver initialized
  async onOAuth2Init() {
    this.log('Driver initialized (oAuth2)');
  }

  // Pair devices
  async onPairListDevices({oAuth2Client}) {
    this.log('Listing devices');

    const modules = await oAuth2Client.getModules();

    let devices = [];

    for (const module of modules.analysr) {
      const pool = await oAuth2Client.getPool(module.Serial);

      devices.push({
        name: `${pool.Type.Name} (${module.Serial})`,
        data: {
          id: module.Serial,
        },
        settings: {
          serial_number: String(module.Serial),
          version: String(module.Version),
          volume: String(pool.Volume) + ' m³',
          construction_year: String(pool.BuiltYear)
        }
      });
    }

    return devices;
  }

}

module.exports = Driver;
