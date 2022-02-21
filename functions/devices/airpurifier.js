const Fan = require('./fan.js');

class AirPurifier extends Fan {
  get type() {
    return 'action.devices.types.AIRPURIFIER';
  }
}

module.exports = AirPurifier;
