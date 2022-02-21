const DefaultCommand = require('./default.js');
const TV = require('../devices/tv.js');

class SelectChannel extends DefaultCommand {
  get type() {
    return 'action.devices.commands.selectChannel';
  }

  get hasValidParams() {
    return (
      ('channelCode' in this.params && typeof this.params.channelCode === 'string') ||
      ('channelName' in this.params && typeof this.params.channelName === 'string') ||
      ('channelNumber' in this.params && typeof this.params.channelNumber === 'string')
    );
  }

  get requiresItem() {
    return true;
  }

  get itemName() {
    if ('tvChannel' in this.members) {
      return this.members.tvChannel;
    }
    throw { statusCode: 400 };
  }

  convertParamsToValue(item) {
    const channelMap = new TV(item).channelMap;
    if (this.params.channelNumber && this.params.channelNumber in channelMap) {
      return this.params.channelNumber;
    }
    const search = this.params.channelName || this.params.channelCode;
    for (const number in channelMap) {
      if (channelMap[number].includes(search)) {
        return number;
      }
    }
    throw { errorCode: 'noAvailableChannel' };
  }

  getResponseStates(item) {
    return {
      channelNumber: this.convertParamsToValue(item)
    };
  }
}

module.exports = SelectChannel;
