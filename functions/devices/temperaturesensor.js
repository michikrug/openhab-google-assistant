const DefaultDevice = require('./default.js');
const convertToCelsius = require('../utilities.js').convertToCelsius;

class TemperatureSensor extends DefaultDevice {
  get type() {
    return 'action.devices.types.SENSOR';
  }

  get traits() {
    return ['action.devices.traits.TemperatureControl'];
  }

  get requiredItemTypes() {
    return ['Number'];
  }

  get attributes() {
    return {
      queryOnlyTemperatureControl: true,
      temperatureUnitForUX: this.config.useFahrenheit === true ? 'F' : 'C'
    };
  }

  get validDeviceType() {
    return this.deviceType.toLowerCase() == 'temperaturesensor';
  }

  get state() {
    let state = Number(parseFloat(this.item.state).toFixed(1));
    if (this.config.useFahrenheit === true) {
      state = convertToCelsius(state);
    }
    return {
      temperatureSetpointCelsius: state,
      temperatureAmbientCelsius: state
    };
  }
}

module.exports = TemperatureSensor;
