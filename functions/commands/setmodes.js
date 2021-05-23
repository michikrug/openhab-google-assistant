const DefaultCommand = require('./default.js');
const DynamicModesDevice = require('../devices/dynamicmodesdevice.js');
const Fan = require('../devices/fan.js');

class SetModes extends DefaultCommand {
  static get type() {
    return 'action.devices.commands.SetModes';
  }

  static validateParams(params) {
    return 'updateModeSettings' in params && typeof params.updateModeSettings === 'object';
  }

  static getItemName(item, device) {
    const deviceType = this.getDeviceType(device);
    if (deviceType.startsWith('DynamicModes')) {
      const members = DynamicModesDevice.getMembers(item);
      if ('modesCurrentMode' in members) {
        return members.modesCurrentMode.name;
      }
      throw { statusCode: 400 };
    }
    if (['AirPurifier', 'Fan', 'Hood'].includes(deviceType)) {
      const members = Fan.getMembers(item);
      if ('fanMode' in members) {
        return members.fanMode.name;
      }
      throw { statusCode: 400 };
    }
    return item.name;
  }

  static convertParamsToValue(params) {
    const mode = Object.keys(params.updateModeSettings)[0];
    return params.updateModeSettings[mode].toString();
  }

  static getResponseStates(params) {
    const mode = Object.keys(params.updateModeSettings)[0];
    return {
      currentModeSettings: {
        [mode]: params.updateModeSettings[mode]
      }
    };
  }
}

module.exports = SetModes;
