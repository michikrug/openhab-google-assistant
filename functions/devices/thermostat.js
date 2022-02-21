const DefaultDevice = require('./default.js');
const convertToCelsius = require('../utilities.js').convertToCelsius;

class Thermostat extends DefaultDevice {
  get type() {
    return 'action.devices.types.THERMOSTAT';
  }
  get traits() {
    return ['action.devices.traits.TemperatureSetting'];
  }

  get requiredItemTypes() {
    return ['Group'];
  }

  get supportedMembers() {
    return [
      { name: 'thermostatMode', types: ['Number', 'String', 'Switch'] },
      { name: 'thermostatTemperatureSetpoint', types: ['Number'] },
      { name: 'thermostatTemperatureSetpointHigh', types: ['Number'] },
      { name: 'thermostatTemperatureSetpointLow', types: ['Number'] },
      { name: 'thermostatTemperatureAmbient', types: ['Number'] },
      { name: 'thermostatHumidityAmbient', types: ['Number'] }
    ];
  }

  get validDeviceType() {
    return super.validDeviceType && Object.keys(this.members).length > 0;
  }

  get attributes() {
    const attributes = {
      thermostatTemperatureUnit: this.useFahrenheit ? 'F' : 'C'
    };
    if ('thermostatTemperatureRange' in this.config) {
      const [min, max] = this.config.thermostatTemperatureRange.split(',').map((s) => parseFloat(s.trim()));
      if (!isNaN(min) && !isNaN(max)) {
        attributes.thermostatTemperatureRange = {
          minThresholdCelsius: min,
          maxThresholdCelsius: max
        };
      }
    }
    const members = this.members;
    if (
      'thermostatTemperatureAmbient' in members &&
      !('thermostatMode' in members) &&
      !('thermostatTemperatureSetpoint' in members)
    ) {
      attributes.queryOnlyTemperatureSetting = true;
    } else {
      attributes.availableThermostatModes = Object.keys(this.modeMap);
    }
    return attributes;
  }

  get state() {
    const state = {};
    const members = this.members;
    for (const member in members) {
      if (member == 'thermostatMode') {
        state[member] = this.translateModeToGoogle(members[member].state);
      } else {
        state[member] = Number(parseFloat(members[member].state).toFixed(1));
        if (member.indexOf('Temperature') > 0 && this.useFahrenheit) {
          state[member] = convertToCelsius(state[member]);
        }
      }
    }
    return state;
  }

  get useFahrenheit() {
    return this.config.thermostatTemperatureUnit === 'F' || this.config.useFahrenheit === true;
  }

  get modeMap() {
    let modes = ['off', 'heat', 'cool', 'on', 'heatcool', 'auto', 'eco'];
    if ('modes' in this.config) {
      modes = this.config.modes.split(',').map((s) => s.trim());
    }
    const modeMap = {};
    modes.forEach((pair) => {
      const [key, value] = pair.split('=').map((s) => s.trim());
      modeMap[key] = value ? value.split(':').map((s) => s.trim()) : [key];
    });
    return modeMap;
  }

  translateModeToOpenhab(mode) {
    const modeMap = this.modeMap;
    if (mode in modeMap) {
      return modeMap[mode][0];
    }
    throw { statusCode: 400 };
  }

  translateModeToGoogle(mode) {
    const modeMap = this.modeMap;
    for (const key in modeMap) {
      if (modeMap[key].includes(mode)) {
        return key;
      }
    }
    return 'on';
  }
}

module.exports = Thermostat;
