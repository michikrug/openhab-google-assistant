const DefaultDevice = require('./default.js');

class SimpleSecuritySystem extends DefaultDevice {
  get type() {
    return 'action.devices.types.SECURITYSYSTEM';
  }

  get traits() {
    return ['action.devices.traits.ArmDisarm'];
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
      isArmed: state
    };
  }
}

module.exports = SimpleSecuritySystem;
