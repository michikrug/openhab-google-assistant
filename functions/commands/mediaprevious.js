const DefaultCommand = require('./default.js');

class MediaPrevious extends DefaultCommand {
  get type() {
    return 'action.devices.commands.mediaPrevious';
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
    return 'PREVIOUS';
  }
}

module.exports = MediaPrevious;
