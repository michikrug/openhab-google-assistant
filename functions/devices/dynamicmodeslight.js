const DynamicModesDevice = require('./dynamicmodesdevice.js');

class DynamicModesLight extends DynamicModesDevice {
  get type() {
    return 'action.devices.types.LIGHT';
  }
}

module.exports = DynamicModesLight;
