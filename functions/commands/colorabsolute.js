const DefaultCommand = require('./default.js');

class ColorAbsolute extends DefaultCommand {
  get type() {
    return 'action.devices.commands.ColorAbsolute';
  }

  get hasValidParams() {
    return (
      'color' in this.params &&
      typeof this.params.color === 'object' &&
      'spectrumHSV' in this.params.color &&
      typeof this.params.color.spectrumHSV === 'object'
    );
  }

  get requiresItem() {
    return this.deviceType === 'SpecialColorLight' && !this.hasMembers;
  }

  get itemName() {
    if (this.deviceType === 'SpecialColorLight') {
      if ('lightColor' in this.members) {
        return this.members.lightColor;
      }
      throw { statusCode: 400 };
    }
    return this.device.id;
  }

  convertParamsToValue() {
    if (this.deviceType !== 'ColorLight' && this.deviceType !== 'SpecialColorLight') {
      throw { statusCode: 400 };
    }
    const hsv = this.params.color.spectrumHSV;
    return [hsv.hue, hsv.saturation * 100, hsv.value * 100].join(',');
  }

  getResponseStates() {
    return {
      color: {
        spectrumHsv: this.params.color.spectrumHSV
      }
    };
  }
}

module.exports = ColorAbsolute;
