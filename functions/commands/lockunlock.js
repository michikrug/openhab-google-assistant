const DefaultCommand = require('./default.js');

class LockUnlock extends DefaultCommand {
  get type() {
    return 'action.devices.commands.LockUnlock';
  }

  get hasValidParams() {
    return 'lock' in this.params && typeof this.params.lock === 'boolean';
  }

  convertParamsToValue() {
    if (this.itemType === 'Contact') {
      throw { statusCode: 400 };
    }
    let lock = this.params.lock;
    if (this.isInverted) {
      lock = !lock;
    }
    return lock ? 'ON' : 'OFF';
  }

  getResponseStates() {
    return {
      isLocked: this.params.lock
    };
  }
}

module.exports = LockUnlock;
