const DefaultCommand = require('./default.js');

class ActivateScene extends DefaultCommand {
  get type() {
    return 'action.devices.commands.ActivateScene';
  }

  get hasValidParams() {
    return (
      ('deactivate' in this.params && typeof this.params.deactivate === 'boolean') || !('deactivate' in this.params)
    );
  }

  convertParamsToValue() {
    let deactivate = this.params.deactivate;
    if (this.isInverted) {
      deactivate = !deactivate;
    }
    return !deactivate ? 'ON' : 'OFF';
  }
}

module.exports = ActivateScene;
