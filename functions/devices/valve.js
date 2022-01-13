const DefaultDevice = require('./default.js');

class Valve extends DefaultDevice {
  get type() {
    return 'action.devices.types.VALVE';
  }

  get traits() {
    return ['action.devices.traits.OpenClose'];
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
      openPercent: state ? 100 : 0
    };
  }
}

module.exports = Valve;
