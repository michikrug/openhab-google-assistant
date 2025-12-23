const DefaultCommand = require('./default.js');

class StartStop extends DefaultCommand {
  static get type() {
    return 'action.devices.commands.StartStop';
  }

  static validateParams(params) {
    return 'start' in params && typeof params.start === 'boolean';
  }

  static convertParamsToValue(params, _, device) {
    const itemType = this.getItemType(device);
    if (itemType === 'Contact') {
      throw { statusCode: 400 };
    }
    if (itemType === 'Rollershutter') {
      return params.start ? 'MOVE' : 'STOP';
    }
    return params.start ? 'ON' : 'OFF';
  }

  static getItemName(device) {
    if (this.getDeviceType(device) === 'Vacuum') {
      const members = this.getMembers(device);
      if ('vacuumPower' in members) {
        return members.vacuumPower;
      }
      throw { statusCode: 400 };
    }
    if (this.getDeviceType(device) === 'Washer') {
      const members = this.getMembers(device);
      if ('washerPower' in members) {
        return members.washerPower;
      }
      // If it's a new Washer but no washerPower, we probably can't control it via StartStop
      // unless we want to assume the group itself accepts ON/OFF, but the Washer device requires explicit members.
    }
    return device.id;
  }

  static getResponseStates(params) {
    return {
      isRunning: params.start,
      isPaused: !params.start
    };
  }

  static checkCurrentState(target, state, params) {
    if (target === state) {
      throw { errorCode: params.start ? 'alreadyStarted' : 'alreadyStopped' };
    }
  }
}

module.exports = StartStop;
