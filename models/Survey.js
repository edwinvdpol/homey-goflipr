'use strict';

class Survey {

  /**
   * Represents a survey.
   *
   * @constructor
   */
  constructor(data) {
    this.data = data;
  }

  /**
   * Return capability values.
   *
   * @return {Object}
   */
  get capabilityValues() {
    return Object.fromEntries(Object.entries({
      measure_temperature: this.surveyValue('Temperature'),
      measure_ci: this.surveyValue('Desinfectant'),
      status_ci: this.surveyStatus('Desinfectant'),
      measure_ph: this.surveyValue('PH'),
      status_ph: this.surveyStatus('PH'),
      measure_orp: this.surveyValue('OxydoReductionPotentiel'),
    }).filter(([_, v]) => v));
  }

  /**
   * Get status of property from survey.
   *
   * @param {Object} property
   * @return {string|null}
   */
  surveyStatus(property) {
    if (!(property in this.data)) return null;

    const prop = this.data[property];

    // Validate property
    if (typeof prop !== 'object') return null;

    // Check if deviation sector exists
    if (!('DeviationSector' in prop)) return null;

    return prop.DeviationSector;
  }

  /**
   * Get value of property from survey.
   *
   * @param {Object} property
   * @return {number|null}
   */
  surveyValue(property) {
    if (!(property in this.data)) return null;

    const prop = this.data[property];

    // Temperature
    if (property === 'Temperature') {
      return prop;
    }

    // Validate property
    if (typeof prop !== 'object') return null;

    // Check if value exists
    if (!('Value' in prop)) return null;

    return Number(prop.Value);
  }

}

module.exports = Survey;
