const DefaultCommand = require('./default.js');
const TV = require('../devices/tv.js');

class AppSelect extends DefaultCommand {
  get type() {
    return 'action.devices.commands.appSelect';
  }

  get hasValidParams() {
    return (
      ('newApplication' in this.params && typeof this.params.newApplication === 'string') ||
      ('newApplicationName' in this.params && typeof this.params.newApplicationName === 'string')
    );
  }

  get requiresItem() {
    return true;
  }

  get itemName() {
    if ('tvApplication' in this.members) {
      return this.members.tvApplication;
    }
    throw { statusCode: 400 };
  }

  convertParamsToValue(item) {
    const applicationMap = new TV(item).applicationMap;
    if (this.params.newApplication && this.params.newApplication in applicationMap) {
      return this.params.newApplication;
    }
    const search = this.params.newApplicationName;
    for (const key in applicationMap) {
      if (applicationMap[key].includes(search)) {
        return key;
      }
    }
    throw { errorCode: 'noAvailableApp' };
  }

  getResponseStates(item) {
    return {
      currentApplication: this.convertParamsToValue(item)
    };
  }
}

module.exports = AppSelect;
