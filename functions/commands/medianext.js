const DefaultCommand = require('./default.js');

class MediaNext extends DefaultCommand {
  static get type() {
    return 'action.devices.commands.mediaNext';
  }

  static requiresItem(device) {
    return !this.hasMembers(device);
  }

  static getItemName(device) {
    const members = this.getMembers(device);
    if ('tvTransport' in members) {
      return members.tvTransport;
    }
    throw { statusCode: 400 };
  }

  static convertParamsToValue() {
    return 'NEXT';
  }
}

module.exports = MediaNext;
