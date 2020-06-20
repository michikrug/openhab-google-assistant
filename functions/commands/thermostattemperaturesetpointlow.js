const DefaultCommand = require('./default.js');
const Thermostat = require('../devices/thermostat.js');

class ThermostatTemperatureSetpointLow extends DefaultCommand {
  static get type() {
    return 'action.devices.commands.ThermostatTemperatureSetpointLow';
  }

  static validateParams(params) {
    return ('thermostatTemperatureSetpointLow' in params) && typeof params.thermostatTemperatureSetpointLow === 'number';
  }

  static get requiresItem() {
    return true;
  }

  static getItemName(item) {
    const members = Thermostat.getMembers(item);
    if ('thermostatTemperatureSetpointLow' in members) {
      return members.thermostatTemperatureSetpointLow.name;
    }
    throw { statusCode: 400 };
  }

  static convertParamsToValue(params, item) {
    let value = params.thermostatTemperatureSetpointLow;
    if (Thermostat.usesFahrenheit(item)) {
      value = Thermostat.convertToFahrenheit(value);
    }
    return value.toString();
  }

  static getResponseStates(params, item) {
    const states = Thermostat.getState(item);
    states.thermostatTemperatureSetpointLow = params.thermostatTemperatureSetpointLow;
    return states;
  }
}

module.exports = ThermostatTemperatureSetpointLow;
