const ModesDevice = require('./modesdevice.js');

class ModesLight extends ModesDevice {
  get type() {
    return 'action.devices.types.LIGHT';
  }
}

module.exports = ModesLight;
