const Switch = require('./switch.js');

class SimpleLight extends Switch {
  get type() {
    return 'action.devices.types.LIGHT';
  }
}

module.exports = SimpleLight;
