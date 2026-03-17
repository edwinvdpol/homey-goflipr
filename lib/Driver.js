'use strict';

const { OAuth2Driver } = require('homey-oauth2app');
const Pool = require('./Pool');

class Driver extends OAuth2Driver {

  /*
  | Driver events
  */

  // Driver initialized
  async onOAuth2Init() {
    this.log('Initialized');
  }

  // Driver destroyed
  async onOAuth2Uninit() {
    this.log('Destroyed');
  }

  /*
  | Pairing functions
  */

  // Pair devices
  async onPairListDevices({ oAuth2Client }) {
    this.log(`Pairing ${this.id}s`);

    const results = await oAuth2Client.discoverDevices(this.id);

    // Log raw devices
    this.log('Raw devices', JSON.stringify(results));

    // Convert raw devices to device data
    const devices = await Promise.all(results.map((device) => this.getDeviceData(oAuth2Client, device)).filter((e) => e));

    // Log found devices
    this.log('Found devices', JSON.stringify(devices));

    return devices;
  }

  // Return data to create the device
  async getDeviceData(client, device) {
    let raw = await client.getDevice(device.Serial);

    // Create pool object
    let pool = new Pool({ ...raw, ...device });

    // Return device data
    return pool.device;
  }

  /**
   * Repair device.
   *
   * @param {PairSession} socket
   * @param {Device} device
   */
  onRepair(socket, device) {
    this.log('[Repair] Session connected');

    let client;

    let {
      OAuth2SessionId,
      OAuth2ConfigId,
    } = device.getStore();

    if (!OAuth2SessionId) {
      OAuth2SessionId = OAuth2Util.getRandomId();
    }

    if (!OAuth2ConfigId) {
      OAuth2ConfigId = this.getOAuth2ConfigId();
    }

    try {
      client = this.homey.app.getOAuth2Client({
        sessionId: OAuth2SessionId,
        configId: OAuth2ConfigId,
      });
    } catch (err) {
      client = this.homey.app.createOAuth2Client({
        sessionId: OAuth2SessionId,
        configId: OAuth2ConfigId,
      });
    }

    const onLogin = async ({ username, password }) => {
      this.log('[Repair] Login');

      await client.getTokenByCredentials({ username, password });
      const session = await client.onGetOAuth2SessionInformation();

      OAuth2SessionId = session.id;
      const token = client.getToken();
      const { title } = session;
      client.destroy();

      // Replace the temporary client by the final one and save it
      client = this.homey.app.createOAuth2Client({
        sessionId: session.id,
        configId: OAuth2ConfigId,
      });

      client.setTitle({ title });
      client.setToken({ token });

      await client.save();

      // Set client for OAuth2 devices
      await this.homey.app.setClientOAuth2Devices(client, OAuth2SessionId, OAuth2ConfigId);

      return true;
    };

    const onDisconnect = async () => {
      this.log('[Repair] Session disconnected');
    };

    socket
      .setHandler('login', onLogin)
      .setHandler('disconnect', onDisconnect);
  }

}

module.exports = Driver;
