const DefaultCommand = require('./default.js');

class SetModes extends DefaultCommand {
  get type() {
    return 'action.devices.commands.SetModes';
  }

  get hasValidParams() {
    return 'updateModeSettings' in this.params && typeof this.params.updateModeSettings === 'object';
  }

  get requiresItem() {
    const deviceType = this.deviceType;
    return (
      (deviceType.startsWith('DynamicModes') || ['AirPurifier', 'Fan', 'Hood'].includes(deviceType)) && !this.hasMembers
    );
  }

  get itemName() {
    if (this.deviceType.startsWith('DynamicModes')) {
      if ('modesCurrentMode' in this.members) {
        return this.members.modesCurrentMode;
      }
      throw { statusCode: 400 };
    }
    if (['AirPurifier', 'Fan', 'Hood'].includes(this.deviceType)) {
      if ('fanMode' in this.members) {
        return this.members.fanMode;
      }
      throw { statusCode: 400 };
    }
    return this.device.id;
  }

  convertParamsToValue() {
    const mode = Object.keys(this.params.updateModeSettings)[0];
    return this.params.updateModeSettings[mode].toString();
  }

  getResponseStates() {
    const mode = Object.keys(this.params.updateModeSettings)[0];
    return {
      currentModeSettings: {
        [mode]: this.params.updateModeSettings[mode]
      }
    };
  }
}

module.exports = SetModes;
