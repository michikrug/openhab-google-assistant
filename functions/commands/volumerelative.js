const DefaultCommand = require('./default.js');
const TV = require('../devices/tv.js');

class VolumeRelative extends DefaultCommand {
  get type() {
    return 'action.devices.commands.volumeRelative';
  }

  get hasValidParams() {
    return 'relativeSteps' in this.params && typeof this.params.relativeSteps === 'number';
  }

  get requiresItem() {
    return true;
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

  convertParamsToValue(item) {
    let state = item.state;
    if (this.deviceType === 'TV') {
      const members = new TV(item).members;
      if ('tvVolume' in members) {
        state = members.tvVolume.state;
      } else {
        throw { statusCode: 400 };
      }
    }
    let level = parseInt(state) + this.params.relativeSteps;
    return (level < 0 ? 0 : level > 100 ? 100 : level).toString();
  }

  getResponseStates(item) {
    return {
      currentVolume: parseInt(this.convertParamsToValue(item))
    };
  }
}

module.exports = VolumeRelative;
