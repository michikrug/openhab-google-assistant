const DefaultCommand = require('./default.js');
const Thermostat = require('../devices/thermostat.js');
const convertToFahrenheit = require('../utilities.js').convertToFahrenheit;

class ThermostatTemperatureSetpointLow extends DefaultCommand {
  get type() {
    return 'action.devices.commands.ThermostatTemperatureSetpointLow';
  }

  get hasValidParams() {
    return (
      'thermostatTemperatureSetpointLow' in this.params &&
      typeof this.params.thermostatTemperatureSetpointLow === 'number'
    );
  }

  get requiresItem() {
    return true;
  }
  get itemName() {
    if ('thermostatTemperatureSetpointLow' in this.members) {
      return this.members.thermostatTemperatureSetpointLow;
    }
    throw { statusCode: 400 };
  }

  convertParamsToValue(item) {
    let value = this.params.thermostatTemperatureSetpointLow;
    return (new Thermostat(item).useFahrenheit ? convertToFahrenheit(value) : value).toString();
  }

  getResponseStates(item) {
    const states = new Thermostat(item).state;
    states.thermostatTemperatureSetpointLow = this.params.thermostatTemperatureSetpointLow;
    return states;
  }
}

module.exports = ThermostatTemperatureSetpointLow;
