const DefaultCommand = require('./default.js');
const rgb2hsv = require('../utilities.js').rgb2hsv;
const kelvin2rgb = require('../utilities.js').kelvin2rgb;

class ColorAbsoluteTemperature extends DefaultCommand {
  get type() {
    return 'action.devices.commands.ColorAbsolute';
  }

  get hasValidParams() {
    return (
      'color' in this.params &&
      typeof this.params.color === 'object' &&
      'temperature' in this.params.color &&
      typeof this.params.color.temperature === 'number'
    );
  }

  get requiresItem() {
    return this.deviceType !== 'SpecialColorLight' || !this.hasMembers;
  }

  get itemName() {
    if (this.deviceType === 'SpecialColorLight') {
      if ('lightColorTemperature' in this.members) {
        return this.members.lightColorTemperature;
      }
      throw { statusCode: 400 };
    }
    return this.device.id;
  }

  convertParamsToValue(item) {
    if (this.deviceType === 'SpecialColorLight') {
      try {
        if (this.customData.useKelvin) {
          return this.params.color.temperature.toString();
        }
        const { temperatureMinK, temperatureMaxK } = this.customData.colorTemperatureRange;
        return (
          100 -
          ((this.params.color.temperature - temperatureMinK) / (temperatureMaxK - temperatureMinK)) * 100
        ).toString();
      } catch (error) {
        return '0';
      }
    }
    const hsv = rgb2hsv(kelvin2rgb(this.params.color.temperature));
    const hsvArray = item.state.split(',').map((val) => Number(val));
    return [Math.round(hsv.hue * 100) / 100, Math.round(hsv.saturation * 1000) / 10, hsvArray[2]].join(',');
  }

  getResponseStates() {
    return {
      color: {
        temperatureK: this.params.color.temperature
      }
    };
  }
}

module.exports = ColorAbsoluteTemperature;
