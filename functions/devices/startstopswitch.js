const DefaultDevice = require('./default.js');

class StartStopSwitch extends DefaultDevice {
  get traits() {
    return ['action.devices.traits.StartStop'];
  }

  get requiredItemTypes() {
    return ['Switch'];
  }

  get attributes() {
    return { pausable: false };
  }

  get state() {
    let state = this.item.state === 'ON';
    if (this.config.inverted === true) {
      state = !state;
    }
    return {
      isRunning: state,
      isPaused: !state
    };
  }
}

module.exports = StartStopSwitch;
