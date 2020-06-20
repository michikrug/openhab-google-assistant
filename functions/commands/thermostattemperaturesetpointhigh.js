const DefaultCommand = require('./default.js');
const Thermostat = require('../devices/thermostat.js');

class ThermostatTemperatureSetpointHigh extends DefaultCommand {
  static get type() {
    return 'action.devices.commands.ThermostatTemperatureSetpointHigh';
  }

  static validateParams(params) {
    return ('thermostatTemperatureSetpointHigh' in params) && typeof params.thermostatTemperatureSetpointHigh === 'number';
  }

  static get requiresItem() {
    return true;
  }

  static getItemName(item) {
    const members = Thermostat.getMembers(item);
    if ('thermostatTemperatureSetpointHigh' in members) {
      return members.thermostatTemperatureSetpointHigh.name;
    }
    throw { statusCode: 400 };
  }

  static convertParamsToValue(params, item) {
    let value = params.thermostatTemperatureSetpointHigh;
    if (Thermostat.usesFahrenheit(item)) {
      value = Thermostat.convertToFahrenheit(value);
    }
    return value.toString();
  }

  static getResponseStates(params, item) {
    const states = Thermostat.getState(item);
    states.thermostatTemperatureSetpointHigh = params.thermostatTemperatureSetpointHigh;
    return states;
  }
}

module.exports = ThermostatTemperatureSetpointHigh;
