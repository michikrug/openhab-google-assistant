const DefaultCommand = require('./default.js');

class OpenClose extends DefaultCommand {
  get type() {
    return 'action.devices.commands.OpenClose';
  }

  get hasValidParams() {
    return 'openPercent' in this.params && typeof this.params.openPercent === 'number';
  }

  convertParamsToValue() {
    const itemType = this.itemType;
    if (itemType === 'Contact') {
      throw { statusCode: 400 };
    }
    let openPercent = this.params.openPercent;
    if (this.isInverted) {
      openPercent = 100 - openPercent;
    }
    if (itemType === 'Rollershutter') {
      return openPercent === 0 ? 'DOWN' : openPercent === 100 ? 'UP' : (100 - openPercent).toString();
    }
    if (itemType === 'Switch') {
      return openPercent === 0 ? 'OFF' : 'ON';
    }
    return openPercent.toString();
  }

  getResponseStates() {
    return {
      openPercent: this.params.openPercent
    };
  }
}

module.exports = OpenClose;
