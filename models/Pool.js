'use strict';

const { filled } = require('../lib/Utils');

class Pool {

  /**
   * Represents a pool.
   *
   * @constructor
   */
  constructor(data) {
    this.serial = data.Serial;
    this.type = data.Type;
    this.version = data.Version;
    this.volume = data.Volume;
    this.builtYear = data.BuiltYear;
  }

  /**
   * Return device data.
   *
   * @return {Object}
   */
  get data() {
    if (!this.valid) return {};

    return {
      name: `${this.type.Name} (${this.serial})`,
      data: {
        id: this.serial,
      },
      settings: this.settings,
    };
  }

  /**
   * Return device settings.
   *
   * @return {Object}
   */
  get settings() {
    if (!this.valid) return {};

    return {
      serial_number: this.serial,
      version: String(this.version),
      volume: `${this.volume} m³`,
      construction_year: String(this.builtYear),
    };
  }

  /**
   * Return whether device is valid.
   *
   * @return {boolean}
   */
  get valid() {
    return filled(this.serial) && filled(this.type);
  }

}

module.exports = Pool;
