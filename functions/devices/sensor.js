const DefaultDevice = require('./default.js');

class Sensor extends DefaultDevice {
  get type() {
    return 'action.devices.types.SENSOR';
  }

  get traits() {
    return ['action.devices.traits.SensorState'];
  }

  get requiredItemTypes() {
    return ['Number', 'String', 'Dimmer', 'Switch', 'Rollershutter', 'Contact'];
  }

  get validDeviceType() {
    return super.validDeviceType && !!this.attributes.sensorStatesSupported;
  }

  get attributes() {
    const config = this.config;
    if (!('sensorName' in config) || (!('valueUnit' in config) && !('states' in config))) return {};
    const attributes = { sensorStatesSupported: [{ name: config.sensorName }] };
    if ('valueUnit' in config) {
      attributes.sensorStatesSupported[0].numericCapabilities = {
        rawValueUnit: config.valueUnit
      };
    }
    if ('states' in config) {
      attributes.sensorStatesSupported[0].descriptiveCapabilities = {
        availableStates: config.states.split(',').map((s) => s.trim().split('=')[0].trim())
      };
    }
    return attributes;
  }

  get state() {
    return {
      currentSensorStateData: [
        {
          name: this.config.sensorName,
          currentSensorState: this.translateStateToGoogle(),
          rawValue: Number(this.item.state) || 0
        }
      ]
    };
  }

  getNotification() {
    return {
      SensorState: {
        priority: 0,
        name: this.config.sensorName,
        currentSensorState: this.translateStateToGoogle()
      }
    };
  }

  translateStateToGoogle() {
    if ('states' in this.config) {
      const states = this.config.states.split(',').map((s) => s.trim());
      for (const state of states) {
        const [key, value] = state.split('=').map((s) => s.trim());
        if (value == this.item.state) {
          return key;
        }
      }
    }
    return '';
  }
}

module.exports = Sensor;
