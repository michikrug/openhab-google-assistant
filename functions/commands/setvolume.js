const DefaultCommand = require('./default.js');

class SetVolume extends DefaultCommand {
  get type() {
    return 'action.devices.commands.setVolume';
  }

  get hasValidParams() {
    return 'volumeLevel' in this.params && typeof this.params.volumeLevel === 'number';
  }

  get requiresItem() {
    return this.deviceType === 'TV' && !this.hasMembers;
  }

  get itemName() {
    if (this.deviceType === 'TV') {
      if ('tvVolume' in this.members) {
        return this.members.tvVolume;
      }
      throw { statusCode: 400 };
    }
    return this.device.id;
  }

  convertParamsToValue() {
    return this.params.volumeLevel.toString();
  }

  getResponseStates() {
    return {
      currentVolume: this.params.volumeLevel
    };
  }
}

module.exports = SetVolume;
