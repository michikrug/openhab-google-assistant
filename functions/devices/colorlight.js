const DefaultDevice = require('./default.js');

class ColorLight extends DefaultDevice {
  get type() {
    return 'action.devices.types.LIGHT';
  }

  get traits() {
    return ['action.devices.traits.OnOff', 'action.devices.traits.Brightness', 'action.devices.traits.ColorSetting'];
  }

  get requiredItemTypes() {
    return ['Color'];
  }

  get attributes() {
    const attributes = {
      colorModel: 'hsv'
    };
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


  get state() {
    const [hue, sat, val] = this.item.state.split(',').map((s) => Number(s.trim()));
    return {
      on: val > 0,
      brightness: val,
      color: {
        spectrumHSV: {
          hue: hue,
          saturation: sat / 100,
          value: val / 100
        }
      }
    };
  }
}

module.exports = ColorLight;
