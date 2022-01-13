const Switch = require('./switch.js');

class WaterHeater extends Switch {
  get type() {
    return 'action.devices.types.WATERHEATER';
  }
}

module.exports = WaterHeater;
