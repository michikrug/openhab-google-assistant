const DefaultCommand = require('./default.js');
const Thermostat = require('../devices/thermostat.js');

class ThermostatSetMode extends DefaultCommand {
  static get type() {
    return 'action.devices.commands.ThermostatSetMode';
  }

  static validateParams(params) {
    return 'thermostatMode' in params && typeof params.thermostatMode === 'string';
  }

  static requiresItem() {
    return true;
  }

  static getItemName(device) {
    const members = this.getMembers(device);
    if ('thermostatMode' in members) {
      return members.thermostatMode;
    }
    throw { statusCode: 400 };
  }

  static convertParamsToValue(params, item) {
    return new Thermostat(item).translateModeToOpenhab(params.thermostatMode);
  }

  static getResponseStates(params, item) {
    const states = new Thermostat(item).state;
    states.thermostatMode = params.thermostatMode;
    return states;
  }
}

module.exports = ThermostatSetMode;
