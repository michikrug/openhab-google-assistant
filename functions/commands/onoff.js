const DefaultCommand = require('./default.js');
const SpecialColorLight = require('../devices/specialcolorlight.js');
const TV = require('../devices/tv.js');
const Fan = require('../devices/fan.js');

class OnOff extends DefaultCommand {
  static get type() {
    return 'action.devices.commands.OnOff';
  }

  static validateParams(params) {
    return 'on' in params && typeof params.on === 'boolean';
  }

  static getItemName(item, device) {
    const deviceType = this.getDeviceType(device);
    if (deviceType.startsWith('DynamicModes')) {
      throw { statusCode: 400 };
    }
    if (deviceType === 'SpecialColorLight') {
      const members = SpecialColorLight.getMembers(item);
      if ('lightBrightness' in members) {
        return members.lightBrightness.name;
      }
      throw { statusCode: 400 };
    }
    if (deviceType === 'TV') {
      const members = TV.getMembers(item);
      if ('tvPower' in members) {
        return members.tvPower.name;
      }
      throw { statusCode: 400 };
    }
    if (deviceType === 'Fan' && this.getItemType(device) !== 'Dimmer') {
      const members = Fan.getMembers(item);
      if ('fanPower' in members) {
        return members.fanPower.name;
      }
      throw { statusCode: 400 };
    }
    return item.name;
  }

  static convertParamsToValue(params, _, device) {
    let on = params.on;
    if (this.isInverted(device) === true) {
      on = !on;
    }
    return on ? 'ON' : 'OFF';
  }

  static getResponseStates(params) {
    return {
      on: params.on
    };
  }
}

module.exports = OnOff;
