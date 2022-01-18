const DefaultCommand = require('./default.js');

class BrightnessAbsolute extends DefaultCommand {
  get type() {
    return 'action.devices.commands.BrightnessAbsolute';
  }

  get hasValidParams() {
    return 'brightness' in this.params && typeof this.params.brightness === 'number';
  }

  get requiresItem() {
    return this.deviceType === 'SpecialColorLight' && !this.hasMembers;
  }

  get itemName() {
    if (this.deviceType === 'SpecialColorLight') {
      const members = this.members;
      if ('lightBrightness' in members) {
        return members.lightBrightness;
      }
      throw { statusCode: 400 };
    }
    return this.device.id;
  }

  convertParamsToValue() {
    return this.params.brightness.toString();
  }

  getResponseStates() {
    return {
      brightness: this.params.brightness
    };
  }
}

module.exports = BrightnessAbsolute;
