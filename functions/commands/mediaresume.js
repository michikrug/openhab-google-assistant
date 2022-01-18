const DefaultCommand = require('./default.js');

class MediaResume extends DefaultCommand {
  get type() {
    return 'action.devices.commands.mediaResume';
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
    return 'PLAY';
  }
}

module.exports = MediaResume;
