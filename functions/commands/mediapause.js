const DefaultCommand = require('./default.js');

class MediaPause extends DefaultCommand {
  get type() {
    return 'action.devices.commands.mediaPause';
  }

  get requiresItem() {
    return !this.hasMembers;
  }

  get itemName() {
    if ('tvTransport' in this.members) {
      return this.members.tvTransport;
    }
    throw { statusCode: 400 };
  }

  convertParamsToValue() {
    return 'PAUSE';
  }
}

module.exports = MediaPause;
