const OpenCloseDevice = require('./openclosedevice.js');

class Gate extends OpenCloseDevice {
  get type() {
    return 'action.devices.types.GATE';
  }
}

module.exports = Gate;
