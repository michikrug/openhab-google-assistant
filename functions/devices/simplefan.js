const Switch = require('./switch.js');

class SimpleFan extends Switch {
  get type() {
    return 'action.devices.types.FAN';
  }
}

module.exports = SimpleFan;
