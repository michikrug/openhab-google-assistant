const DefaultCommand = require('./default.js');

class OnOff extends DefaultCommand {
  get type() {
    return 'action.devices.commands.OnOff';
  }

  get hasValidParams() {
    return 'on' in this.params && typeof this.params.on === 'boolean';
  }

  get requiresItem() {
    const deviceType = this.deviceType;
    return (
      (deviceType === 'SpecialColorLight' ||
        deviceType === 'TV' ||
        (['AirPurifier', 'Fan', 'Hood'].includes(deviceType) && this.itemType !== 'Dimmer')) &&
      !this.hasMembers
    );
  }

  get itemName() {
    const deviceType = this.deviceType;
    if (deviceType.startsWith('DynamicModes')) {
      throw { statusCode: 400 };
    }
    const members = this.members;
    if (deviceType === 'SpecialColorLight') {
      if ('lightPower' in members) {
        return members.lightPower;
      }
      if ('lightBrightness' in members) {
        return members.lightBrightness;
      }
      throw { statusCode: 400 };
    }
    if (deviceType === 'TV') {
      if ('tvPower' in members) {
        return members.tvPower;
      }
      throw { statusCode: 400 };
    }
    if (['AirPurifier', 'Fan', 'Hood'].includes(deviceType) && this.itemType !== 'Dimmer') {
      if ('fanPower' in members) {
        return members.fanPower;
      }
      throw { statusCode: 400 };
    }
    return this.device.id;
  }

  convertParamsToValue() {
    let on = this.params.on;
    if (this.isInverted) {
      on = !on;
    }
    return on ? 'ON' : 'OFF';
  }

  getResponseStates() {
    return {
      on: this.params.on
    };
  }
}

module.exports = OnOff;
