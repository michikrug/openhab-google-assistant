const DefaultDevice = require('./default.js');
const convertFahrenheitToCelsius = require('../utilities.js').convertFahrenheitToCelsius;

class ClimateSensor extends DefaultDevice {
  static get type() {
    return 'action.devices.types.SENSOR';
  }

  static getTraits() {
    return ['action.devices.traits.TemperatureSetting'];
  }

  static getAttributes(item) {
    return {
      queryOnlyTemperatureSetting: true,
      thermostatTemperatureUnit: this.useFahrenheit(item) === true ? 'F' : 'C'
    };
  }

  static get requiredItemTypes() {
    return ['Group'];
  }

  static matchesDeviceType(item) {
    return (
      item.metadata &&
      item.metadata.ga &&
      item.metadata.ga.value.toLowerCase() == 'climatesensor' &&
      Object.keys(this.getMembers(item)).length > 0
    );
  }

  static getState(item) {
    const state = {};
    const members = this.getMembers(item);
    for (const member in members) {
      state[member] = Number(parseFloat(members[member].state).toFixed(1));
      if (member === 'thermostatTemperatureAmbient' && this.useFahrenheit(item)) {
        state[member] = convertFahrenheitToCelsius(state[member]);
      }
    }
    return state;
  }

  static get supportedMembers() {
    return [
      { name: 'thermostatTemperatureAmbient', types: ['Number'] },
      { name: 'thermostatHumidityAmbient', types: ['Number'] }
    ];
  }

  static useFahrenheit(item) {
    const config = this.getConfig(item);
    return config.thermostatTemperatureUnit === 'F' || config.useFahrenheit === true;
  }
}

module.exports = ClimateSensor;
