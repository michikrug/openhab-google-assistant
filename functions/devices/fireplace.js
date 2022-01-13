const Switch = require('./switch.js');

class Fireplace extends Switch {
  get type() {
    return 'action.devices.types.FIREPLACE';
  }
}

module.exports = Fireplace;
