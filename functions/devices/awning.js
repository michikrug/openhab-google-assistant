const OpenCloseDevice = require('./openclosedevice.js');

class Awning extends OpenCloseDevice {
  get type() {
    return 'action.devices.types.AWNING';
  }
}

module.exports = Awning;
