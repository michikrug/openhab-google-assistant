const DefaultCommand = require('./default.js');
const Fan = require('../devices/fan.js');

class SetFanSpeed extends DefaultCommand {
  static get type() {
    return 'action.devices.commands.SetFanSpeed';
  }

  static validateParams(params) {
    return 'fanSpeed' in params && typeof params.fanSpeed === 'string';
  }

  static getItemName(item, device) {
    const deviceType = this.getDeviceType(device);
    if (['AirPurifier', 'Fan', 'Hood'].includes(deviceType) && this.getItemType(device) !== 'Dimmer') {
      const members = Fan.getMembers(item);
      if ('fanSpeed' in members) {
        return members.fanSpeed.name;
      }
      throw { statusCode: 400 };
    }
    return item.name;
  }

  static convertParamsToValue(params) {
    return params.fanSpeed.toString();
  }

  static getResponseStates(params) {
    return {
      currentFanSpeedSetting: params.fanSpeed
    };
  }
}

module.exports = SetFanSpeed;
