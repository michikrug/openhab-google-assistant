const DefaultCommand = require('./default.js');
const Thermostat = require('../devices/thermostat.js');
const convertToFahrenheit = require('../utilities.js').convertToFahrenheit;

class ThermostatTemperatureSetpoint extends DefaultCommand {
  get type() {
    return 'action.devices.commands.ThermostatTemperatureSetpoint';
  }

  get hasValidParams() {
    return (
      'thermostatTemperatureSetpoint' in this.params && typeof this.params.thermostatTemperatureSetpoint === 'number'
    );
  }

  get requiresItem() {
    return true;
  }

  get itemName() {
    if ('thermostatTemperatureSetpoint' in this.members) {
      return this.members.thermostatTemperatureSetpoint;
    }
    throw { statusCode: 400 };
  }

  convertParamsToValue(item) {
    let value = this.params.thermostatTemperatureSetpoint;
    return (new Thermostat(item).useFahrenheit ? convertToFahrenheit(value) : value).toString();
  }

  getResponseStates(item) {
    const states = new Thermostat(item).state;
    states.thermostatTemperatureSetpoint = this.params.thermostatTemperatureSetpoint;
    return states;
  }
}

module.exports = ThermostatTemperatureSetpoint;
