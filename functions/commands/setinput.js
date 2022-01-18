const DefaultCommand = require('./default.js');

class SetInput extends DefaultCommand {
  get type() {
    return 'action.devices.commands.SetInput';
  }

  get hasValidParams() {
    return 'newInput' in this.params && typeof this.params.newInput === 'string';
  }

  get requiresItem() {
    return !this.hasMembers;
  }

  get itemName() {
    if ('tvInput' in this.members) {
      return this.members.tvInput;
    }
    throw { statusCode: 400 };
  }

  convertParamsToValue() {
    return this.params.newInput;
  }

  getResponseStates() {
    return {
      currentInput: this.params.newInput
    };
  }
}

module.exports = SetInput;
