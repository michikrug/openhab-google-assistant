const DefaultCommand = require('./default.js');

class MediaResume extends DefaultCommand {
  static get type() {
    return 'action.devices.commands.mediaResume';
  }

  static getItemName(device) {
    const members = (device.customData && device.customData.members) || {};
    if ('tvTransport' in members) {
      return members.tvTransport;
    }
    throw { statusCode: 400 };
  }

  static convertParamsToValue() {
    return 'PLAY';
  }
}

module.exports = MediaResume;
