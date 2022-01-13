const OpenCloseDevice = require('./openclosedevice.js');

class Blinds extends OpenCloseDevice {
  get type() {
    return 'action.devices.types.BLINDS';
  }
}

module.exports = Blinds;
