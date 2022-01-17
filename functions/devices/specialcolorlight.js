const DefaultDevice = require('./default.js');

class SpecialColorLight extends DefaultDevice {
  get type() {
    return 'action.devices.types.LIGHT';
  }

  get traits() {
    return ['action.devices.traits.OnOff', 'action.devices.traits.Brightness', 'action.devices.traits.ColorSetting'];
  }

  get requiredItemTypes() {
    return ['Group'];
  }

 get supportedMembers() {
    return [
      { name: 'lightPower', types: ['Switch'] },
      { name: 'lightColor', types: ['Color'] },
      { name: 'lightBrightness', types: ['Dimmer', 'Number'] },
      { name: 'lightColorTemperature', types: ['Dimmer', 'Number'] }
    ];
  }

  get validDeviceType() {
    return !!(
      super.validDeviceType &&
      Object.keys(this.members).length > 1 &&
      (!('lightColorTemperature' in this.members) || this.useKelvin || !!this.attributes.colorTemperatureRange)
    );
  }

  get attributes() {
    const attributes = {};
    if ('lightColor' in this.members) {
      attributes.colorModel = 'hsv';
    }
    if ('colorTemperatureRange' in this.config) {
      const [min, max] = this.config.colorTemperatureRange.split(',').map((s) => Number(s.trim()));
      if (!isNaN(min) && !isNaN(max)) {
        attributes.colorTemperatureRange = {
          temperatureMinK: min,
          temperatureMaxK: max
        };
      }
    }
    return attributes;
  }

  get metadata() {
    const metadata = super.metadata;
    metadata.customData.colorTemperatureRange = this.attributes.colorTemperatureRange;
    metadata.customData.useKelvin = this.useKelvin;
    return metadata;
  }

  get state() {
    const state = {};
    const members = this.members;
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
        case 'lightColor':
          try {
            const [hue, sat, val] = members[member].state.split(',').map((s) => Number(s.trim()));
            if (val > 0) {
              state.color = {
                spectrumHSV: {
                  hue: hue,
                  saturation: sat / 100,
                  value: val / 100
                }
              };
            }
          } catch (error) {
            //
          }
          break;
        case 'lightColorTemperature':
          if (state.color) {
            break;
          }
          try {
            if (this.useKelvin) {
              state.color = {
                temperatureK: Number(members[member].state)
              };
            } else {
              const { temperatureMinK, temperatureMaxK } = this.attributes.colorTemperatureRange;
              state.color = {
                temperatureK:
                  temperatureMinK +
                  (((temperatureMaxK - temperatureMinK) / 100) * (100 - Number(members[member].state)) || 0)
              };
            }
          } catch (error) {
            //
          }
          break;
      }
    }
    return state;
  }

  get useKelvin() {
    return this.config.useKelvin === true;
  }
}

module.exports = SpecialColorLight;
