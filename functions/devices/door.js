const OpenCloseDevice = require('./openclosedevice.js');

class Door extends OpenCloseDevice {
  get type() {
    return 'action.devices.types.DOOR';
  }
}

module.exports = Door;
