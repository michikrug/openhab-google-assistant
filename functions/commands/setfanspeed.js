const DefaultCommand = require('./default.js');

class SetFanSpeed extends DefaultCommand {
  get type() {
    return 'action.devices.commands.SetFanSpeed';
  }

  get hasValidParams() {
    return 'fanSpeed' in this.params && typeof this.params.fanSpeed === 'string';
  }

  get requiresItem() {
    const deviceType = this.deviceType;
    return ['AirPurifier', 'Fan', 'Hood'].includes(deviceType) && this.itemType !== 'Dimmer' && !this.hasMembers;
  }

  get itemName() {
    const deviceType = this.deviceType;
    if (['AirPurifier', 'Fan', 'Hood'].includes(deviceType) && this.itemType !== 'Dimmer') {
      if ('fanSpeed' in this.members) {
        return this.members.fanSpeed;
      }
      throw { statusCode: 400 };
    }
    return this.device.id;
  }

  convertParamsToValue() {
    return this.params.fanSpeed.toString();
  }

  getResponseStates() {
    return {
      currentFanSpeedSetting: this.params.fanSpeed
    };
  }
}

module.exports = SetFanSpeed;
