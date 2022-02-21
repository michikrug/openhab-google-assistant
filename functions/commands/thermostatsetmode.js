const DefaultCommand = require('./default.js');
const Thermostat = require('../devices/thermostat.js');

class ThermostatSetMode extends DefaultCommand {
  get type() {
    return 'action.devices.commands.ThermostatSetMode';
  }

  get hasValidParams() {
    return 'thermostatMode' in this.params && typeof this.params.thermostatMode === 'string';
  }

  get requiresItem() {
    return true;
  }

  get itemName() {
    if ('thermostatMode' in this.members) {
      return this.members.thermostatMode;
    }
    throw { statusCode: 400 };
  }

  convertParamsToValue(item) {
    return new Thermostat(item).translateModeToOpenhab(this.params.thermostatMode);
  }

  getResponseStates(item) {
    const states = new Thermostat(item).state;
    states.thermostatMode = this.params.thermostatMode;
    return states;
  }
}

module.exports = ThermostatSetMode;
