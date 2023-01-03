const DefaultDevice = require('./default.js');

class HumiditySensor extends DefaultDevice {
  static get type() {
    return 'action.devices.types.SENSOR';
  }

  static getTraits() {
    return ['action.devices.traits.TemperatureSetting'];
  }

  static getAttributes() {
    return {
      queryOnlyTemperatureSetting: true
    };
  }

  static get requiredItemTypes() {
    return ['Number'];
  }

  static matchesDeviceType(item) {
    return item.metadata && item.metadata.ga && item.metadata.ga.value.toLowerCase() == 'humiditysensor';
  }

  static getState(item) {
    return {
      thermostatHumidityAmbient: Number(parseFloat(item.state).toFixed(1))
    };
  }
}

module.exports = HumiditySensor;
