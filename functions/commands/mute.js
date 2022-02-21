const DefaultCommand = require('./default.js');

class Mute extends DefaultCommand {
  get type() {
    return 'action.devices.commands.mute';
  }

  get hasValidParams() {
    return 'mute' in this.params && typeof this.params.mute === 'boolean';
  }

  get requiresItem() {
    return this.deviceType === 'TV' && !this.hasMembers;
  }

  get itemName() {
    if (this.deviceType === 'TV') {
      if ('tvMute' in this.members) {
        return this.members.tvMute;
      }
      if ('tvVolume' in this.members) {
        return this.members.tvVolume;
      }
      throw { statusCode: 400 };
    }
    return this.device.id;
  }

  convertParamsToValue() {
    let itemType = this.itemType;
    if (this.deviceType === 'TV') {
      if ('tvMute' in this.members) {
        itemType = 'Switch';
      }
    }
    let mute = this.params.mute;
    if (itemType !== 'Switch') {
      return mute ? '0' : undefined;
    }
    if (this.isInverted) {
      mute = !mute;
    }
    return mute ? 'ON' : 'OFF';
  }

  getResponseStates() {
    return {
      isMuted: this.params.mute
    };
  }
}

module.exports = Mute;
