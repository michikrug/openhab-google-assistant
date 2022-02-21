const DefaultCommand = require('./default.js');

class MediaNext extends DefaultCommand {
  get type() {
    return 'action.devices.commands.mediaNext';
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
    return 'NEXT';
  }
}

module.exports = MediaNext;
