const DefaultDevice = require('./default.js');

class Lock extends DefaultDevice {
  get type() {
    return 'action.devices.types.LOCK';
  }

  get traits() {
    return ['action.devices.traits.LockUnlock'];
  }

  get requiredItemTypes() {
    return ['Switch', 'Contact'];
  }

  get state() {
    let state = this.item.state === 'ON' || this.item.state === 'CLOSED';
    if (this.config.inverted === true) {
      state = !state;
    }
    return {
      isLocked: state
    };
  }
}

module.exports = Lock;
