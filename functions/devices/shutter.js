const OpenCloseDevice = require('./openclosedevice.js');

class Shutter extends OpenCloseDevice {
  get type() {
    return 'action.devices.types.SHUTTER';
  }
}

module.exports = Shutter;
