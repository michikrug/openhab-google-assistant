const DefaultDevice = require('./default.js');

class Switch extends DefaultDevice {
  get type() {
    return 'action.devices.types.SWITCH';
  }

  get traits() {
    return ['action.devices.traits.OnOff'];
  }

  get requiredItemTypes() {
    return ['Switch'];
  }

  get state() {
    let state = this.item.state === 'ON';
    if (this.config.inverted === true) {
      state = !state;
    }
    return {
      on: state
    };
  }
}

module.exports = Switch;
