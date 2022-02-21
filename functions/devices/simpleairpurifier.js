const Switch = require('./switch.js');

class SimpleAirPurifier extends Switch {
  get type() {
    return 'action.devices.types.AIRPURIFIER';
  }
}

module.exports = SimpleAirPurifier;
