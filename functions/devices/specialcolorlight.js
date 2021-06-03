const DefaultDevice = require('./default.js');

class SpecialColorLight extends DefaultDevice {
  static get type() {
    return 'action.devices.types.LIGHT';
  }

  static getTraits() {
    return ['action.devices.traits.OnOff', 'action.devices.traits.Brightness', 'action.devices.traits.ColorSetting'];
  }

  static get requiredItemTypes() {
    return ['Group'];
  }

  static matchesDeviceType(item) {
    return !!(
      super.matchesDeviceType(item) &&
      Object.keys(this.getMembers(item)).length === 2 &&
      (this.useKelvin(item) || !!this.getAttributes(item).colorTemperatureRange)
    );
  }

  static getAttributes(item) {
    const attributes = {};
    const config = this.getConfig(item);
    if ('colorTemperatureRange' in config) {
      const [min, max] = config.colorTemperatureRange.split(',').map((s) => Number(s.trim()));
      if (!isNaN(min) && !isNaN(max)) {
        attributes.colorTemperatureRange = {
          temperatureMinK: min,
          temperatureMaxK: max
        };
      }
    }
    return attributes;
  }

  static getMetadata(item) {
    const metadata = super.getMetadata(item);
    metadata.customData.colorTemperatureRange = this.getAttributes(item).colorTemperatureRange;
    metadata.customData.useKelvin = this.useKelvin(item);
    return metadata;
  }

  static getState(item) {
    const state = {};
    const members = this.getMembers(item);
    for (const member in members) {
      switch (member) {
        case 'lightPower':
          state.on = members[member].state === 'ON';
          break;
        case 'lightBrightness':
          state.brightness = Number(members[member].state) || 0;
          if (!('lightPower' in members)) {
            state.on = state.brightness > 0;
          }
          break;
        case 'lightColorTemperature':
          try {
            const { temperatureMinK, temperatureMaxK } = this.getAttributes(item).colorTemperatureRange;
            state.color = {};
            state.color.temperatureK = this.useKelvin(item)
              ? Number(members[member].state)
              : temperatureMinK +
                (((temperatureMaxK - temperatureMinK) / 100) * (100 - Number(members[member].state)) || 0);
          } catch (error) {
            //
          }
          break;
      }
    }
    return state;
  }

  static get supportedMembers() {
    return [
      { name: 'lightPower', types: ['Switch'] },
      { name: 'lightBrightness', types: ['Dimmer', 'Number'] },
      { name: 'lightColorTemperature', types: ['Dimmer', 'Number'] }
    ];
  }

  static useKelvin(item) {
    return this.getConfig(item).useKelvin === true;
  }
}

module.exports = SpecialColorLight;
