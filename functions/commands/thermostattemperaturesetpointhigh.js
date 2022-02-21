const DefaultCommand = require('./default.js');
const Thermostat = require('../devices/thermostat.js');
const convertToFahrenheit = require('../utilities.js').convertToFahrenheit;

class ThermostatTemperatureSetpointHigh extends DefaultCommand {
  get type() {
    return 'action.devices.commands.ThermostatTemperatureSetpointHigh';
  }

  get hasValidParams() {
    return (
      'thermostatTemperatureSetpointHigh' in this.params &&
      typeof this.params.thermostatTemperatureSetpointHigh === 'number'
    );
  }

  get requiresItem() {
    return true;
  }

  get itemName() {
    if ('thermostatTemperatureSetpointHigh' in this.members) {
      return this.members.thermostatTemperatureSetpointHigh;
    }
    throw { statusCode: 400 };
  }

  convertParamsToValue(item) {
    let value = this.params.thermostatTemperatureSetpointHigh;
    return (new Thermostat(item).useFahrenheit ? convertToFahrenheit(value) : value).toString();
  }

  getResponseStates(item) {
    const states = new Thermostat(item).state;
    states.thermostatTemperatureSetpointHigh = this.params.thermostatTemperatureSetpointHigh;
    return states;
  }
}

module.exports = ThermostatTemperatureSetpointHigh;
