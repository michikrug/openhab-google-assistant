const OpenCloseDevice = require('./openclosedevice.js');

class Window extends OpenCloseDevice {
  get type() {
    return 'action.devices.types.WINDOW';
  }
}

module.exports = Window;
