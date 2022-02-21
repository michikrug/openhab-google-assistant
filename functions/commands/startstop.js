const DefaultCommand = require('./default.js');

class StartStop extends DefaultCommand {
  get type() {
    return 'action.devices.commands.StartStop';
  }

  get hasValidParams() {
    return 'start' in this.params && typeof this.params.start === 'boolean';
  }

  convertParamsToValue() {
    if (this.itemType === 'Contact') {
      throw { statusCode: 400 };
    }
    if (this.itemType === 'Rollershutter') {
      return this.params.start ? 'MOVE' : 'STOP';
    }
    return this.params.start ? 'ON' : 'OFF';
  }

  getResponseStates() {
    return {
      isRunning: this.params.start,
      isPaused: !this.params.start
    };
  }
}

module.exports = StartStop;
